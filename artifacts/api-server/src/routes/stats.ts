import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { desc, gte } from "drizzle-orm";

const router = Router();

const checkAuth = (req: any, res: any): boolean => {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.replace("Bearer ", "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!token || token !== expected) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
};

// GET /api/admin/stats
router.get("/admin/stats", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const all = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));

    const total = all.length;
    const pending = all.filter((b) => b.status === "pending").length;
    const confirmed = all.filter((b) => b.status === "confirmed").length;
    const cancelled = all.filter((b) => b.status === "cancelled").length;

    // By zone (use zones array if present, else zone string)
    const byZone: Record<string, number> = {};
    for (const b of all) {
      const zones: string[] = (b.zones as string[] | null) ?? [b.zone];
      for (const z of zones) {
        byZone[z] = (byZone[z] ?? 0) + 1;
      }
    }

    // Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dayLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayLabels.push(d.toISOString().split("T")[0]);
    }
    const perDay = dayLabels.map((day) => ({
      date: day,
      count: all.filter((b) => b.createdAt && new Date(b.createdAt).toISOString().split("T")[0] === day).length,
    }));

    // Peak hours
    const byHour: Record<number, number> = {};
    for (const b of all) {
      if (b.time) {
        const h = parseInt(b.time.split(":")[0], 10);
        byHour[h] = (byHour[h] ?? 0) + 1;
      }
    }
    const peakHours = Object.entries(byHour)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, 3)
      .map(([h, c]) => ({ hour: `${h}:00`, count: c }));

    res.json({ ok: true, stats: { total, pending, confirmed, cancelled, byZone, perDay, peakHours } });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// GET /api/admin/export — download bookings as CSV
router.get("/admin/export", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const all = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));

    const zoneLabels: Record<string, string> = {
      standard: "Стандарт ПК", vip: "VIP ПК",
      playstation: "PlayStation", vip_playstation: "VIP PlayStation",
    };

    const header = ["ID", "Имя", "Телефон", "Telegram", "Зоны", "ПК", "Дата", "Время", "Длит.(ч)", "Комментарий", "Статус", "Создан"];
    const rows = all.map((b) => {
      const zones: string[] = (b.zones as string[] | null) ?? [b.zone];
      const pcsByZone: Record<string, number[]> = (b.pcsByZone as Record<string, number[]> | null) ?? {};
      const pcsParts = zones.map((z) => {
        const pcs = pcsByZone[z] ?? [];
        return pcs.length > 0 ? `${zoneLabels[z] ?? z}: №${pcs.join(",№")}` : (zoneLabels[z] ?? z);
      }).join("; ");
      const allPcs = Object.values(pcsByZone).flat().sort((a,b)=>a-b).join(",");
      return [
        b.id,
        b.name,
        b.phone,
        b.telegram ? `@${b.telegram}` : "",
        zones.map((z) => zoneLabels[z] ?? z).join("; "),
        allPcs,
        b.date ?? "",
        b.time ?? "",
        b.duration ?? "",
        b.comment ? b.comment.replace(/,/g, ";") : "",
        b.status,
        b.createdAt ? new Date(b.createdAt).toLocaleString("ru") : "",
      ].map(String).join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");
    const bom = "\uFEFF";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="willow_bookings_${new Date().toISOString().split("T")[0]}.csv"`);
    res.send(bom + csv);
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

export default router;
