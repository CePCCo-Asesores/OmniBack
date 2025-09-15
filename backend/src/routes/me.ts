import { Router, Request, Response, NextFunction } from "express";
import { verifyToken } from "../auth/session";

const router = Router();

function authGuard(req: Request, res: Response, next: NextFunction) {
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    (req.query.token as string | undefined);

  if (!token) return res.status(401).json({ error: "No token" });

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  (req as any).user = payload;
  next();
}

router.get("/", authGuard, (req, res) => {
  res.json({ me: (req as any).user || null });
});

export default router;

