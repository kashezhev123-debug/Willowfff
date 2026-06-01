import { Router } from "express";
import { db, bookingsTable, blockedPcsTable } from "@workspace/db";
import { and, eq, inArray } from "drizzle-orm";

const router = Router();

// GET /api/pcs/status?zone=standard&date=2026-06-01&time=18:00
router.get("/pcs/status", async (req, res) => {
  const { zone, date, time } = req.query as Record<string, string>;

  if (!zone) {
    res.status(400).json({ ok: false, error: "zone required" });
    return;
  }

  try {
    const conditions: any[] = [
      inArray(bookingsTable.status, ["pending", "confirmed"]),
    ];
    if (date) conditions.push(eq(bookingsTable.date, date));

    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(and(...conditions));

    // Collect booked PCs for this zone from both old and new format
    const bookedPcs: number[] = [];
    for (const booking of bookings) {
      const zones: string[] = (booking.zones as string[] | null) ?? [booking.zone];
      if (!zones.includes(zone)) continue;

      const pcsByZone = booking.pcsByZone as Record<string, number[]> | null;
      if (pcsByZone && pcsByZone[zone]) {
        bookedPcs.push(...pcsByZone[zone]);
      } else if (booking.zone === zone) {
        const pcs = booking.pcNumbers as number[] | null;
        if (pcs && pcs.length > 0) bookedPcs.push(...pcs);
      }
    }

    // Also include blocked PCs
    const blocked = await db
      .select()
      .from(blockedPcsTable)
      .where(eq(blockedPcsTable.zone, zone));
    const blockedNums = blocked.map((b) => b.pcNumber);

    const allUnavailable = [...new Set([...bookedPcs, ...blockedNums])];
    res.json({ ok: true, bookedPcs: allUnavailable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// GET /api/pcs/bookings — admin list
router.get("/pcs/bookings", async (req, res) => {
  try {
    const bookings = await db
      .select()
      .from(bookingsTable)
      .orderBy(bookingsTable.createdAt);
    res.json({ ok: true, bookings });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// PATCH /api/pcs/bookings/:id/status
router.patch("/pcs/bookings/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: string };
  const allowed = ["pending", "confirmed", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ ok: false, error: "Invalid status" });
    return;
  }
  try {
    await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, Number(id)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

export default router;
