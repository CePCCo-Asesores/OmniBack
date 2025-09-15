import { Router } from "express";
const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "omniback",
    time: new Date().toISOString()
  });
});

export default router;
