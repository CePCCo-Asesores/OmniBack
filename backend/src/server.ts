import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import morgan from 'morgan';

import { corsOptions } from './utils/corsOptions'; // usa el tuyo; si no existe, cambia por tu config previa
import { router as healthRouter } from './routes/health';   // asumiendo que ya lo tienes en v2
import { router as versionRouter } from './routes/version'; // idem
import { router as meRouter } from './routes/me';
import { router as profileRouter } from './routes/profile';
import { googleAuthRoutes } from './auth/google'; // ya existe en tu repo v2

// Nota: si tienes un export de "app" en otro archivo, este será ahora el único entrypoint.
const app = express();

// ----- Seguridad y middlewares base -----
app.set('trust proxy', 1); // necesario detrás de Render/Railway/NGINX para cookies secure
app.use(helmet());
app.use(cors(corsOptions || { origin: process.env.ALLOWED_ORIGIN?.split(',') || [], credentials: true }));
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ----- Sesión + Passport (para OAuth Google) -----
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ----- Rutas Públicas -----
app.get('/', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'omni-back', env: process.env.NODE_ENV || 'dev' });
});

// Health / Version
app.use('/health', healthRouter);
app.use('/version', versionRouter);

// OAuth Google (usa tu módulo existente)
app.use('/auth/google', googleAuthRoutes);

// Perfil e identidad
app.use('/profile', profileRouter);
app.use('/me', meRouter);

// ----- Manejador de errores (4 args) -----
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.code || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    // Log detallado solo en dev
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }
  res.status(status).json({ error: message });
});

// ----- Inicio de servidor -----
const PORT = Number(process.env.PORT || 8080);
const HOST = '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`OmniBack listening on http://${HOST}:${PORT}`);
  });
}

export default app;
