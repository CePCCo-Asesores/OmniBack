import { Router, Request, Response } from 'express';
import { createOrg, listOrgs, addUserToOrg } from '../models/org';
import { requireOrgAdmin, requireOrgMember } from '../middleware/requireOrg';

export const router = Router();

// Crear organización (admin global - si no tienes admin global, deja temporalmente abierto a usuarios autenticados)
router.post('/', async (req: Request, res: Response) => {
  const { name, rfc, contact_email, contact_name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  const org = await createOrg({ name, rfc, contact_email, contact_name });
  return res.json(org);
});

// Listar organizaciones (para panel admin global)
router.get('/', async (_req: Request, res: Response) => {
  const orgs = await listOrgs();
  return res.json(orgs);
});

// Agregar usuario a una organización (solo admin de la org)
// POST /orgs/:orgId/users  { userId, role }
router.post('/:orgId/users', requireOrgAdmin(), async (req: Request, res: Response) => {
  const { userId, role } = req.body || {};
  if (!userId || !role) return res.status(400).json({ error: 'userId_and_role_required' });
  await addUserToOrg(req.params.orgId, userId, role);
  return res.json({ ok: true });
});

// Ejemplo de endpoint "ping" de una org (miembro)
router.get('/:orgId/ping', requireOrgMember(), async (_req: Request, res: Response) => {
  return res.json({ ok: true, orgId: (res.req as any).orgId });
});
