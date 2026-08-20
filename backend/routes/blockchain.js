import express from 'express';
import { getChain, validateChain } from '../controllers/blockchain.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Allow public to inspect the chain via the Explorer page
router.get('/', getChain);

// Restrict chain integrity validation checks to admins
router.post('/validate', authMiddleware, adminMiddleware, validateChain);

export default router;
