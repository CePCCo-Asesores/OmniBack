import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import meRoutes from './routes/me';
import healthRoutes from './routes/health';
import versionRoutes from './routes/version';
import errorHandler from './middleware/errorHandler';
import { ALLOWED_ORIGIN, SESSION_SECRET } from './config/env';

const app = express();

// Seguridad
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Sesión + Passport
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/me', meRoutes);
app.use('/health', healthRoutes);
app.use('/version', versionRoutes);

// Handler global
app.use(errorHandler);

export default app;
