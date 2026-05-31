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
  } catch (err) {
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
    await db
      .update(bookingsTable)
      .set({ status })
      .where(eq(bookingsTable.id, Number(id)));
    res.json({ ok: true });
  } catch (err) {
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
  } catch (err) {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

export default router;
