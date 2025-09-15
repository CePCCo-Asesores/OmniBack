import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    const profile = {
      instance: 'omniback',
      activeUI: 'dashboard',
      modules: ['agent-core', 'analytics'],
      user: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        roles: ['admin', 'architect']
      },
      branding: {
        theme: 'dark',
        logo: 'https://cdn.omniback.ai/logo.svg'
      }
    };

    res.json(profile);
  } catch {
    res.status(400).json({ error: 'Token inválido' });
  }
});

export default router;
