import express from 'express';
import multer from 'multer';
import { verifyById, verifyByFile } from '../controllers/verification.js';

const router = express.Router();

// Multer memory storage configuration for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

router.get('/id/:id', verifyById);
router.post('/file', upload.single('file'), verifyByFile);

export default router;
