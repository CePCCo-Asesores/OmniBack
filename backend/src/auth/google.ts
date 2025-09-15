import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "";

// Solo registra la estrategia si hay credenciales
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL
      },
      async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
        // Upsert opcional en tu DB
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user));
  passport.deserializeUser((obj: any, done) => done(null, obj));
}
