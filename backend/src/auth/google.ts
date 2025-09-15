import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import type { VerifyCallback } from 'passport-oauth2';
import crypto from 'crypto';
import { upsertUserFromGoogle, storeRefreshToken, generateRefreshTokenValue } from '../models/user';
import { createAccessToken } from './session';

export const googleAuthRoutes = Router();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const GOOGLE_CLIENT_ID = requireEnv('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = requireEnv('GOOGLE_CLIENT_SECRET');
const GOOGLE_CALLBACK_URL = requireEnv('GOOGLE_CALLBACK_URL');

passport.use(
  new GoogleStrategy(
    { clientID: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET, callbackURL: GOOGLE_CALLBACK_URL },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const email =
          Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
        if (!email) return done(new Error('Google profile sin email válido'));
        const picture =
          Array.isArray(profile.photos) && profile.photos.length > 0 ? profile.photos[0].value : undefined;

        // Upsert de usuario en DB
        const user = await upsertUserFromGoogle({
          googleId: profile.id,
          email,
          name: profile.displayName,
          picture,
        });

        // Claims para access token
        const claims = {
          sub: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          roles: user.roles || ['user'],
          provider: 'google',
        };

        return done(null, claims);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

// Inicio OAuth con STATE anti-CSRF (cookie httpOnly)
googleAuthRoutes.get('/', (req: Request, res: Response, next: NextFunction) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 5 * 60 * 1000,
  });
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', state })(req, res, next);
});

// Callback → valida STATE, genera tokens, setea cookie httponly, redirige
googleAuthRoutes.get(
  '/callback',
  (req: Request, res: Response, next: NextFunction) => {
    const frontend = process.env.PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    const cookieState = (req as any).cookies?.oauth_state;
    const queryState = typeof req.query.state === 'string' ? req.query.state : undefined;
    if (!cookieState || !queryState || cookieState !== queryState) {
      res.clearCookie('oauth_state');
      const u = new URL('/login', frontend);
      u.searchParams.set('error', 'state_mismatch');
      return res.redirect(u.toString());
    }
    res.clearCookie('oauth_state');

    passport.authenticate('google', { session: false }, async (err: any, claims: any) => {
      if (err || !claims) {
        const u = new URL('/login', frontend);
        u.searchParams.set('error', err ? 'oauth_error' : 'no_user');
        if (err?.message) u.searchParams.set('message', err.message);
        return res.redirect(u.toString());
      }

      try {
        // Access token corto
        const access = createAccessToken(claims, process.env.ACCESS_TOKEN_TTL || '15m');

        // Refresh token opaco (rotativo) en cookie httpOnly
        const refresh = generateRefreshTokenValue();
        const ttlMs = Number(process.env.REFRESH_TOKEN_TTL_MS || 1000 * 60 * 60 * 24 * 7); // 7d por defecto
        await storeRefreshToken({
          userId: claims.sub,
          tokenValue: refresh,
          ttlMs,
          userAgent: req.get('user-agent') || undefined,
          ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || undefined,
        });

        res.cookie('rt', refresh, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: ttlMs,
          path: '/', // disponible para /auth/refresh y /auth/logout
        });

        const u = new URL('/auth/callback', frontend);
        u.searchParams.set('token', access);
        return res.redirect(u.toString());
      } catch (e: any) {
        const u = new URL('/login', frontend);
        u.searchParams.set('error', 'token_error');
        if (e?.message) u.searchParams.set('message', e.message);
        return res.redirect(u.toString());
      }
    })(req, res, next);
  }
);
