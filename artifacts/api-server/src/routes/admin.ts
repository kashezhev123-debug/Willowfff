import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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

const zoneLabels: Record<string, string> = {
  standard: "Стандарт ПК",
  vip: "VIP ПК",
  playstation: "PlayStation",
  vip_playstation: "VIP PlayStation",
};

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  }).catch(() => {});
}

// POST /api/admin/login
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password: string };
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) {
    res.status(500).json({ ok: false, error: "Admin password not configured" });
    return;
  }
  if (password === expected) {
    res.json({ ok: true, token: expected });
  } else {
    res.status(401).json({ ok: false, error: "Неверный пароль" });
  }
});

// GET /api/admin/bookings
router.get("/admin/bookings", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const bookings = await db
      .select()
      .from(bookingsTable)
      .orderBy(desc(bookingsTable.createdAt));
    res.json({ ok: true, bookings });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// PATCH /api/admin/bookings/:id
router.patch("/admin/bookings/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { id } = req.params;
  const { status } = req.body as { status: string };
  const allowed = ["pending", "confirmed", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ ok: false, error: "Invalid status" });
    return;
  }
  try {
    // Fetch booking for notification
    const [booking] = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.id, Number(id)));

    await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, Number(id)));

    // Send Telegram notification
    if (booking) {
      const pcs = (booking.pcNumbers as number[] | null) ?? [];
      const pcsLine = pcs.length > 0
        ? `\n🖥 <b>Места:</b> ПК №${pcs.sort((a, b) => a - b).join(", №")}`
        : "";

      const dateLine = booking.date
        ? `\n📅 ${booking.date}${booking.time ? ` в ${booking.time}` : ""}`
        : "";

      if (status === "confirmed") {
        await sendTelegram(
          `✅ <b>Бронирование #${booking.id} подтверждено</b>\n\n` +
          `👤 ${booking.name}\n` +
          `📞 ${booking.phone}\n` +
          `🕹 ${zoneLabels[booking.zone] ?? booking.zone}` +
          pcsLine +
          dateLine
        );
      } else if (status === "cancelled") {
        await sendTelegram(
          `❌ <b>Бронирование #${booking.id} отменено</b>\n\n` +
          `👤 ${booking.name}\n` +
          `📞 ${booking.phone}\n` +
          `🕹 ${zoneLabels[booking.zone] ?? booking.zone}` +
          pcsLine +
          dateLine
        );
      }
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// DELETE /api/admin/bookings/:id
router.delete("/admin/bookings/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { id } = req.params;
  try {
    await db.delete(bookingsTable).where(eq(bookingsTable.id, Number(id)));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

export default router;
