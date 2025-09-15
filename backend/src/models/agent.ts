import { randomUUID } from 'crypto';
import { query } from '../db/pool';

export type Agent = {
  id: string;
  key: string;
  name: string;
  description?: string;
  category?: string;
  config: any;
};

export async function listAgents(): Promise<Agent[]> {
  const r = await query<Agent>(`SELECT id,key,name,description,category,config FROM agents ORDER BY name ASC`);
  return r.rows;
}

export async function createAgent(a: Omit<Agent,'id'>): Promise<Agent> {
  const id = randomUUID();
  await query(
    `INSERT INTO agents (id,key,name,description,category,config) VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, a.key, a.name, a.description || null, a.category || null, a.config || {}]
  );
  const r = await query<Agent>(`SELECT id,key,name,description,category,config FROM agents WHERE id=$1`, [id]);
  return r.rows[0];
}

export async function logAgentRun(params: {
  orgId: string; userId?: string; agentId: string;
  input?: any; output?: any; tokensIn?: number; tokensOut?: number; costUsd?: number;
}) {
  const id = randomUUID();
  await query(
    `INSERT INTO agent_logs (id, org_id, user_id, agent_id, input, output, tokens_in, tokens_out, cost_usd)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, params.orgId, params.userId || null, params.agentId, params.input || {}, params.output || {}, params.tokensIn || 0, params.tokensOut || 0, params.costUsd || 0]
  );
}
