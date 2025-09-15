// modules/analytics/index.ts
import type { Router } from 'express';
import router from './router';

export const manifest = {
  key: 'analytics',
  basePath: '/api/analytics',
  router: router as Router,
  requiresAuth: true,
  requiredRoles: ['analyst'] as string[],
};
export default manifest;
