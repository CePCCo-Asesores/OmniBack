import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupRoutes } from './router';

dotenv.config();

export const startServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  setupRoutes(app);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`OmniBack activo en puerto ${port}`);
  });
};
