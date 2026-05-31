import { Router } from "express";
import { db, bookingsTable } from "@workspace/db";
import { and, eq, gte, lte, inArray } from "drizzle-orm";

const router = Router();

// GET /api/pcs/status?zone=standard&date=2026-06-01&time=18:00&duration=3
router.get("/pcs/status", async (req, res) => {
  const { zone, date, time, duration } = req.query as Record<string, string>;

  if (!zone) {
    res.status(400).json({ ok: false, error: "zone required" });
    return;
  }

  try {
    // Find bookings for the same zone and overlapping date/time
    const conditions = [
      eq(bookingsTable.zone, zone),
      inArray(bookingsTable.status, ["pending", "confirmed"]),
    ];

    if (date) {
      conditions.push(eq(bookingsTable.date, date));
    }

    const bookings = await db
      .select()
      .from(bookingsTable)
      .where(and(...conditions));

    // Collect all booked PC numbers for this zone/date
    const bookedPcs: number[] = [];
    for (const booking of bookings) {
      const pcs = booking.pcNumbers as number[] | null;
      if (pcs && pcs.length > 0) {
        bookedPcs.push(...pcs);
      }
    }

    res.json({ ok: true, bookedPcs: [...new Set(bookedPcs)] });
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

// PATCH /api/pcs/bookings/:id/status — update status
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
