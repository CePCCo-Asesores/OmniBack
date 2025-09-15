import { Router, Request, Response } from 'express';
import { listPlans, getPlan } from '../models/plan';

export const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const plans = await listPlans();
  return res.json(plans);
});

router.get('/:planId', async (req: Request, res: Response) => {
  const plan = await getPlan(req.params.planId);
  if (!plan) return res.status(404).json({ error: 'plan_not_found' });
  return res.json(plan);
});
