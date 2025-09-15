import { randomUUID } from 'crypto';
import { query } from '../db/pool';

export type Subscription = {
  id: string;
  org_id: string;
  plan_id: string;
  status: 'active'|'paused'|'cancelled';
  started_at?: string;
  ends_at?: string | null;
};

export async function upsertSubscription(orgId: string, planId: string, status: Subscription['status']='active'): Promise<Subscription> {
  const existing = await query<Subscription>(`SELECT id,org_id,plan_id,status,started_at,ends_at FROM subscriptions WHERE org_id=$1 AND status='active'`, [orgId]);
  if (existing.rows[0]) {
    const sub = existing.rows[0];
    await query(`UPDATE subscriptions SET plan_id=$1, updated_at=NOW() WHERE id=$2`, [planId, sub.id]);
    const r = await query<Subscription>(`SELECT id,org_id,plan_id,status,started_at,ends_at FROM subscriptions WHERE id=$1`, [sub.id]);
    return r.rows[0];
  }
  const id = randomUUID();
  await query(
    `INSERT INTO subscriptions (id, org_id, plan_id, status) VALUES ($1,$2,$3,$4)`,
    [id, orgId, planId, status]
  );
  const r = await query<Subscription>(`SELECT id,org_id,plan_id,status,started_at,ends_at FROM subscriptions WHERE id=$1`, [id]);
  return r.rows[0];
}

export async function getActiveSubscription(orgId: string): Promise<Subscription | null> {
  const r = await query<Subscription>(`SELECT id,org_id,plan_id,status,started_at,ends_at FROM subscriptions WHERE org_id=$1 AND status='active' LIMIT 1`, [orgId]);
  return r.rows[0] || null;
}
