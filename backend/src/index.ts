import express from 'express';
import cors from 'cors';
import profileRouter from './routes/profile';

const app = express();
app.use(cors());
app.use('/profile', profileRouter);

// ...otras rutas y configuración

export default app;
