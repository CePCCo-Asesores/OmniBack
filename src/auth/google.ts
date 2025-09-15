import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Aquí puedes registrar el usuario en tu sistema universal
  done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

router.use(session({
  secret: process.env.JWT_SECRET!,
  resave: false,
  saveUninitialized: true
}));
router.use(passport.initialize());
router.use(passport.session());

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/callback', passport.authenticate('google', {
  failureRedirect: '/auth/google/failure',
  successRedirect: '/auth/google/success'
}));

router.get('/success', (req, res) => {
  res.send({ status: 'Autenticación exitosa', user: req.user });
});

router.get('/failure', (_, res) => {
  res.status(401).send({ error: 'Falló la autenticación con Google' });
});

export const googleAuthRoutes = router;
