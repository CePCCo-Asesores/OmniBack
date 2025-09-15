// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

type Options = {
  windowMs: number; // ventana en ms
  max: number;      // peticiones permitidas por ventana
  keyGenerator?: (req: Request) => string;
  onLimitReached?: (req: Request, res: Response) => void;
};

function createRateLimiter(opts: Options) {
  const windowMs = opts.windowMs;
  const max = opts.max;
  const keyGen = opts.keyGenerator || ((req) => req.ip || "unknown");
  const store = new Map<string, Bucket>();

  // Limpieza periódica (best-effort)
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) {
      if (v.resetAt <= now) store.delete(k);
    }
  }, Math.min(windowMs, 60_000)).unref?.();

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const key = keyGen(req);
    const now = Date.now();
    const bucket = store.get(key);

    if (!bucket || bucket.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count < max) {
      bucket.count += 1;
      return next();
    }

    // Límite alcanzado
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
    opts.onLimitReached?.(req, res);
    return res.status(429).json({ error: "Too Many Requests" });
  };
}

// Exporta el middleware con valores por defecto (equivalentes a los usados)
export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,
});

export default apiRateLimiter;
