import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupRoutes } from './router';
import { limiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import { corsConfig } from './middleware/cors';

dotenv.config();

export const startServer = () => {
  const app = express();

  app.use(corsConfig);
  app.use(limiter);
  app.use(sanitizeInput);
  app.use(express.json());

  setupRoutes(app);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`OmniBack activo en puerto ${port}`);
  });
};
