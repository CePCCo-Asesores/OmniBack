import { query } from '../db/pool';

export type Plan = {
  id: string;
  name: string;
  declared_value_usd: string; // pg numeric viene como string
  features: any;
};

export async function listPlans(): Promise<Plan[]> {
  const r = await query<Plan>(`SELECT id,name,declared_value_usd,features FROM plans ORDER BY declared_value_usd ASC`);
  return r.rows;
}

export async function getPlan(id: string): Promise<Plan | null> {
  const r = await query<Plan>(`SELECT id,name,declared_value_usd,features FROM plans WHERE id=$1`, [id]);
  return r.rows[0] || null;
}
