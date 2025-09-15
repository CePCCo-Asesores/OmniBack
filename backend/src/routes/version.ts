import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    version: '1.0.0',
    gitSha: process.env.GIT_SHA || 'dev'
  });
});

export default router;
