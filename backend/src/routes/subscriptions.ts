import { Router, Request, Response } from 'express';
import { upsertSubscription, getActiveSubscription } from '../models/subscription';
import { requireOrgAdmin } from '../middleware/requireOrg';

export const router = Router();

// Set/actualizar plan activo de una organización
// POST /subscriptions/:orgId { planId }
router.post('/:orgId', requireOrgAdmin(), async (req: Request, res: Response) => {
  const planId = req.body?.planId as string;
  if (!planId) return res.status(400).json({ error: 'planId_required' });
  const sub = await upsertSubscription(req.params.orgId, planId);
  return res.json(sub);
});

// Ver suscripción activa
router.get('/:orgId', requireOrgAdmin(), async (req: Request, res: Response) => {
  const sub = await getActiveSubscription(req.params.orgId);
  return res.json(sub || null);
});
