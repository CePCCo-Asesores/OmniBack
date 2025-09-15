import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { v4 as uuid } from 'uuid';

import { corsOptions } from './utils/corsOptions';
import { logger } from './utils/logger';
import { router as healthRouter } from './routes/health';
import { router as versionRouter } from './routes/version';
import { router as readyRouter } from './routes/ready';
import { router as meRouter } from './routes/me';
import { router as profileRouter } from './routes/profile';
import { googleAuthRoutes } from './auth/google';

const app = express();

app.set('trust proxy', 1);

// Seguridad base
app.use(helmet());
app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true, preload: true })); // 180 días aprox
app.use(compression());
app.use(cors(corsOptions || { origin: process.env.ALLOWED_ORIGIN?.split(',') || [], credentials: true }));
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '1mb' }));
app.use(cookieParser());

// Logging estructurado + request-id
app.use((req, _res, next) => {
  (req as any).id = uuid();
  next();
});
app.use(pinoHttp({ logger, genReqId: req => (req as any).id }));

// Rate limit para /auth (mitiga abuso)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
app.use('/auth', authLimiter);

// Sesión (si más adelante la usas; el flujo actual usa JWT sin sesión)
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Rutas públicas
app.get('/', (_req: Request, res: Response) => res.json({ ok: true, service: 'omni-back', env: process.env.NODE_ENV || 'dev' }));
app.use('/health', healthRouter);
app.use('/ready', readyRouter);
app.use('/version', versionRouter);

// Auth
app.use('/auth/google', googleAuthRoutes);

// Perfil / identidad
app.use('/profile', profileRouter);
app.use('/me', meRouter);

// Manejo de errores
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.code || 500;
  const message = err.message || 'Internal Server Error';
  logger.error({ err, status }, 'Unhandled error');
  res.status(status).json({ error: message });
});

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
    // Failsafe: si algo se queda colgado
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

export default app;
