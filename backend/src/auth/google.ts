import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import type { VerifyCallback } from 'passport-oauth2';
import crypto from 'crypto';
import { createToken } from './session';

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
        const primaryEmail =
          Array.isArray(profile.emails) && profile.emails.length > 0 ? profile.emails[0].value : undefined;
        const picture =
          Array.isArray(profile.photos) && profile.photos.length > 0 ? profile.photos[0].value : undefined;

        // Aquí podrías hacer upsert del usuario en DB si quieres.
        const userClaims = {
          sub: profile.id,
          provider: 'google',
          email: primaryEmail,
          name: profile.displayName,
          picture,
          // roles: ['user'],
          iss: 'omni-back',
          aud: 'omni-frontend',
        };
        return done(null, userClaims);
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
  // Agrega scopes que necesites
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account', state })(req, res, next);
});

// Callback → valida STATE, genera JWT, redirige al FE con ?token=
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

    passport.authenticate('google', { session: false }, (err: any, user: any) => {
      if (err) {
        const u = new URL('/login', frontend);
        u.searchParams.set('error', 'oauth_error');
        u.searchParams.set('message', (err && err.message) || 'unknown');
        return res.redirect(u.toString());
      }
      if (!user) {
        const u = new URL('/login', frontend);
        u.searchParams.set('error', 'no_user');
        return res.redirect(u.toString());
      }
      try {
        const token = createToken(user);
        const u = new URL('/auth/callback', frontend);
        u.searchParams.set('token', token);
        return res.redirect(u.toString());
      } catch (e: any) {
        const u = new URL('/login', frontend);
        u.searchParams.set('error', 'token_error');
        u.searchParams.set('message', (e && e.message) || 'token_failed');
        return res.redirect(u.toString());
      }
    })(req, res, next);
  }
);
