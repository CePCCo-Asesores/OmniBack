import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import healthRouter from "./routes/health";
import readyRouter from "./routes/ready";
import meRouter from "./routes/me";

import { pool } from "./db/connection";
import "./auth/google"; // se auto-desactiva si no hay envs de Google

export function createServer() {
  const app = express();

  // Seguridad y middlewares básicos
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.use(
    cors({
      origin:
        process.env.ALLOWED_ORIGIN?.split(",").map((s) => s.trim()) || "*",
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "change_me_in_prod",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false } // cambia a true con HTTPS + app.set('trust proxy', 1)
    })
  );

  // Passport (opcional)
  app.use(passport.initialize());
  app.use(passport.session());

  // Rutas
  app.use("/health", healthRouter);
  app.use("/ready", readyRouter);
  app.use("/me", meRouter);

  // Tocar DB al arrancar (log por consola)
  pool
    .query("SELECT 1 as ok")
    .then((r) => console.log("[db] ok:", r.rows[0]))
    .catch((e) => console.error("[db] error:", e.message));

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  // Error handler
  app.use(
    (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error("[error]", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  );

  return app;
}
