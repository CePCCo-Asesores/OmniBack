// backend/src/auth/google.ts
import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import type { VerifyCallback } from 'passport-oauth2';
import { createToken } from './session'; // <-- usamos tu módulo existente de JWT

export const googleAuthRoutes = Router();

/**
 * Utilidad mínima para leer env obligatorias con mensaje claro.
 */
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

/**
 * Configuración de Google OAuth
 * Debes tener definidas:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_CALLBACK_URL  (ej: https://api.tu-dominio.com/auth/google/callback)
 *
 * Opcional:
 * - PUBLIC_URL o FRONTEND_URL para construir el redirect final al FE
 */
const GOOGLE_CLIENT_ID = requireEnv('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = requireEnv('GOOGLE_CLIENT_SECRET');
const GOOGLE_CALLBACK_URL = requireEnv('GOOGLE_CALLBACK_URL');

// Inicializamos la estrategia de Google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        // Extrae datos clave del perfil de Google
        const primaryEmail = Array.isArray(profile.emails) && profile.emails.length > 0
          ? profile.emails[0].value
          : undefined;

        const picture =
          Array.isArray(profile.photos) && profile.photos.length > 0
            ? profile.photos[0].value
            : undefined;

        // Aquí podrías hacer "getOrCreateUser" en tu DB si lo deseas.
        // Para el flujo JWT, generaremos claims mínimos con el sub de Google.
        const userClaims = {
          sub: profile.id,               // Identificador único de Google
          provider: 'google',
          email: primaryEmail,
          name: profile.displayName,
          picture,
          // Puedes añadir roles o metadata de tu sistema aquí si ya los tienes
          // roles: ['user'],
        };

        // Pasamos los claims como "user" a Passport. No guardamos sesión de servidor;
        // el front usará el JWT que generaremos en /callback
        return done(null, userClaims);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// (Opcional) Si usas sesiones de Passport, define serialize/deserialize.
// Aunque en este flujo usamos { session: false }, no estorban.
passport.serializeUser((user: any, done) => {
  done(null, user);
});
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

// Punto de entrada a la autenticación con Google
googleAuthRoutes.get(
  '/',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })
);

// Callback de Google → generamos JWT y redirigimos al FE con ?token=
googleAuthRoutes.get(
  '/callback',
  (req: Request, res: Response, next: NextFunction) => {
    // Usamos authenticate como middleware manual para capturar errores y el "user".
    passport.authenticate(
      'google',
      { session: false },
      (err: any, user: any) => {
        const frontend =
          process.env.PUBLIC_URL ||
          process.env.FRONTEND_URL ||
          'http://localhost:3000';

        if (err) {
          const url = new URL('/login', frontend);
          url.searchParams.set('error', 'oauth_error');
          url.searchParams.set('message', (err && err.message) || 'unknown');
          return res.redirect(url.toString());
        }

        if (!user) {
          const url = new URL('/login', frontend);
          url.searchParams.set('error', 'no_user');
          return res.redirect(url.toString());
        }

        try {
          // Firmamos el JWT con tus utilidades existentes
          const token = createToken(user);
          // Redirigimos al FE con ?token=<jwt>
          const url = new URL('/auth/callback', frontend);
          url.searchParams.set('token', token);
          return res.redirect(url.toString());
        } catch (e: any) {
          const url = new URL('/login', frontend);
          url.searchParams.set('error', 'token_error');
          url.searchParams.set('message', (e && e.message) || 'token_failed');
          return res.redirect(url.toString());
        }
      }
    )(req, res, next);
  }
);
