import { Router } from "express";
import { db, blockedPcsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

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

// GET /api/admin/blocked-pcs — list all blocked PCs (admin)
router.get("/admin/blocked-pcs", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const list = await db.select().from(blockedPcsTable);
    res.json({ ok: true, blocked: list });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// POST /api/admin/blocked-pcs — block a PC
router.post("/admin/blocked-pcs", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { zone, pcNumber, reason } = req.body as { zone: string; pcNumber: number; reason?: string };
  if (!zone || !pcNumber) {
    res.status(400).json({ ok: false, error: "zone and pcNumber required" });
    return;
  }
  try {
    // Check if already blocked
    const existing = await db.select().from(blockedPcsTable)
      .where(and(eq(blockedPcsTable.zone, zone), eq(blockedPcsTable.pcNumber, pcNumber)));
    if (existing.length > 0) {
      res.json({ ok: true, id: existing[0].id, already: true });
      return;
    }
    const [inserted] = await db.insert(blockedPcsTable).values({ zone, pcNumber, reason: reason ?? null }).returning();
    res.json({ ok: true, id: inserted.id });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// DELETE /api/admin/blocked-pcs/:id — unblock
router.delete("/admin/blocked-pcs/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const { id } = req.params;
  try {
    await db.delete(blockedPcsTable).where(eq(blockedPcsTable.id, Number(id)));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

// GET /api/pcs/blocked?zone=standard — public: get blocked pc numbers for a zone
router.get("/pcs/blocked", async (req, res) => {
  const { zone } = req.query as { zone?: string };
  try {
    const conditions = zone ? [eq(blockedPcsTable.zone, zone)] : [];
    const list = conditions.length > 0
      ? await db.select().from(blockedPcsTable).where(conditions[0])
      : await db.select().from(blockedPcsTable);
    res.json({ ok: true, blockedPcs: list.map((b) => b.pcNumber) });
  } catch {
    res.status(500).json({ ok: false, error: "Database error" });
  }
});

export default router;
