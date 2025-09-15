import { randomUUID } from 'crypto';
import { query } from '../db/pool';

export type Organization = {
  id: string;
  name: string;
  rfc?: string;
  contact_email?: string;
  contact_name?: string;
};

export async function createOrg(data: Omit<Organization, 'id'>): Promise<Organization> {
  const id = randomUUID();
  await query(
    `INSERT INTO organizations (id, name, rfc, contact_email, contact_name) VALUES ($1,$2,$3,$4,$5)`,
    [id, data.name, data.rfc || null, data.contact_email || null, data.contact_name || null]
  );
  const r = await query<Organization>(`SELECT id,name,rfc,contact_email,contact_name FROM organizations WHERE id=$1`, [id]);
  return r.rows[0];
}

export async function listOrgs(): Promise<Organization[]> {
  const r = await query<Organization>(`SELECT id,name,rfc,contact_email,contact_name FROM organizations ORDER BY created_at DESC`);
  return r.rows;
}

export async function addUserToOrg(orgId: string, userId: string, role: 'admin'|'member') {
  await query(
    `INSERT INTO organization_users (org_id,user_id,role) VALUES ($1,$2,$3)
     ON CONFLICT (org_id,user_id) DO UPDATE SET role=EXCLUDED.role`,
    [orgId, userId, role]
  );
}

export async function userRoleInOrg(orgId: string, userId: string): Promise<'admin'|'member'|null> {
  const r = await query<{ role: 'admin'|'member' }>(`SELECT role FROM organization_users WHERE org_id=$1 AND user_id=$2`, [orgId, userId]);
  return r.rows[0]?.role ?? null;
}
