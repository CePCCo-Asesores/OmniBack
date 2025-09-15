import { Router, Request, Response } from 'express';
import { listAgents } from '../models/agent';
import { requireOrgMember } from '../middleware/requireOrg';
import { logAgentRun } from '../models/agent';

export const router = Router();

// Listar catálogo global (filtrar por plan en FE o extender aquí)
router.get('/catalog', async (_req: Request, res: Response) => {
  const agents = await listAgents();
  return res.json(agents);
});

// Ejecutar un agente (stub): aquí invocarías tu orquestador/LLM y luego loggearías
router.post('/:agentId/run/:orgId', requireOrgMember(), async (req: Request, res: Response) => {
  const { agentId, orgId } = req.params;
  const user = (req as any).user;
  const input = req.body || {};

  // TODO: integrar tu fábrica/orquestador real aquí
  const output = { ok: true, message: 'Agent executed (stub). Integrate LLM here.' };

  await logAgentRun({
    orgId,
    userId: user?.sub,
    agentId,
    input,
    output,
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0
  });

  return res.json(output);
});
