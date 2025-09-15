import { Router } from 'express';
import { googleAuthRoutes } from '../auth/google';

const router = Router();
router.use('/google', googleAuthRoutes);

export default router;
