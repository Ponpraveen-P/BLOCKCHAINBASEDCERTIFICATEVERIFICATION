import express from 'express';
import { getSystemStats } from '../controllers/reports.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, getSystemStats);

export default router;
