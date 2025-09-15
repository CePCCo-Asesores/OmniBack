import { Router } from 'express';
import { verifyToken } from '../utils/jwt';

const router = Router();

router.get('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const claims = verifyToken(token);
    res.json({ user: claims });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
