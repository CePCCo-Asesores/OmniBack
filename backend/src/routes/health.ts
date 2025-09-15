import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    db: 'pending', // conectar con PG si aplica
    version: '1.0.0',
    uptime: process.uptime()
  });
});

export default router;
