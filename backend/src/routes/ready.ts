import { Router } from "express";
import { pool } from "../db/connection";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ready");
    res.json({ ready: r.rows[0].ready === 1 });
  } catch (e: any) {
    res.status(500).json({ ready: false, error: e?.message || "db error" });
  }
});

export default router;
