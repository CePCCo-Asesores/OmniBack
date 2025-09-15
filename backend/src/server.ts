// backend/src/server.ts
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { v4 as uuid } from 'uuid';

import { corsOptions } from './utils/corsOptions';
import { logger } from './utils/logger';

import { router as healthRouter } from './routes/health';
import { router as readyRouter } from './routes/ready';
import { router as versionRouter } from './routes/version';
import { router as profileRouter } from './routes/profile';
import { router as meRouter } from './routes/me';

import { googleAuthRoutes } from './auth/google';
import authRouter from './routes/auth'; // /auth/refresh y /auth/logout

// 👇 NUEVO: routers de plataforma (multi-tenant / agents / plans / subs)
import { router as orgsRouter } from './routes/orgs';
import { router as plansRouter } from './routes/plans';
import { router as subsRouter } from './routes/subscriptions';
import { router as agentsRouter } from './routes/agents';

const app = express();

// ------------------------ Base & Seguridad ------------------------
app.set('trust proxy', 1); // cookies secure detrás de proxy (Railway/Render)

app.use(helmet());
// HSTS solo en prod
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true }));
}

app.use(compression());
app.use(cookieParser());
app.use(cors(corsOptions || { origin: process.env.ALLOWED_ORIGIN?.split(',') || [], credentials: true }));

app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '1mb' }));

// ------------------------ Logging (pino) ------------------------
app.use((req, _res, next) => {
  (req as any).id = uuid();
  next();
});
app.use(pinoHttp({ logger, genReqId: (req) => (req as any).id }));

// ------------------------ Rate limit ------------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth', authLimiter);

// ------------------------ Session (si la necesitas) ------------------------
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ------------------------ Rutas públicas ------------------------
app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, service: process.env.SERVICE_NAME || 'omni-back', env: process.env.NODE_ENV || 'dev' });
});

app.use('/health', healthRouter);
app.use('/ready', readyRouter);
app.use('/version', versionRouter);

// ------------------------ Auth ------------------------
app.use('/auth/google', googleAuthRoutes); // OAuth Google (con STATE y redirect ?token=)
app.use('/auth', authRouter);              // /auth/refresh y /auth/logout

// ------------------------ Rutas app existentes ------------------------
app.use('/profile', profileRouter); // pública
app.use('/me', meRouter);           // requiere Bearer (access token)

// ------------------------ Rutas de plataforma (multi-tenant) ------------------------
app.use('/orgs', orgsRouter);
app.use('/plans', plansRouter);
app.use('/subscriptions', subsRouter);
app.use('/agents', agentsRouter);

// ------------------------ Manejo de errores ------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.code || 500;
  const message = err.message || 'Internal Server Error';
  logger.error({ err, status }, 'Unhandled error');
  res.status(status).json({ error: message });
});

// ------------------------ Inicio + graceful shutdown ------------------------
const PORT = Number(process.env.PORT || 8080);
const HOST = '0.0.0.0';
let server: import('http').Server;

if (require.main === module) {
  server = app.listen(PORT, HOST, () => logger.info(`OmniBack listening on http://${HOST}:${PORT}`));

  const shutdown = (signal: string) => {
    logger.warn({ signal }, 'Shutting down gracefully');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref(); // failsafe
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
