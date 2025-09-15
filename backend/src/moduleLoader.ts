// src/moduleLoader.ts
import { Express, Router } from 'express';
import fs from 'fs';
import path from 'path';

type Manifest = {
  key: string;
  basePath: string;
  router: Router;
  requiresAuth?: boolean;
  requiredRoles?: string[];
};

export async function mountModules(app: Express) {
  const dir = path.join(__dirname, 'modules');
  const entries = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const d of entries) {
    const modPath = path.join(dir, d.name, 'index.js'); // en runtime (dist)
    if (!fs.existsSync(modPath)) continue;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(modPath);
    const m: Manifest = mod.default || mod.manifest;
    if (!m?.router || !m?.basePath) continue;

    // (Opcional) middlewares de auth/roles
    const chain: any[] = [];
    if (m.requiresAuth) {
      chain.push(require('./middleware/requireAuth').requireAuth);
    }
    if (m.requiredRoles?.length) {
      chain.push(require('./middleware/requireRole').requireRole(m.requiredRoles));
    }

    app.use(m.basePath, ...chain, m.router);
    // eslint-disable-next-line no-console
    console.log(`[modules] mounted ${m.key} at ${m.basePath}`);
  }
}
