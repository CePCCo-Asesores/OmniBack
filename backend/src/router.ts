import { Express } from 'express';

export const setupRoutes = (app: Express) => {
  app.get('/', (_, res) => {
    res.send({ status: 'OmniBack operativo', timestamp: new Date().toISOString() });
  });

  // Aquí se agregarán rutas como /auth/google, /engine/activate, /defense/audit, etc.
};
