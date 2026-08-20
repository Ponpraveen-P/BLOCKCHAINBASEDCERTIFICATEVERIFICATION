import express from 'express';
import {
  generateCertificate,
  getCertificates,
  getCertificateById,
  getStudentCertificates
} from '../controllers/certificate.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Generate certificate is strictly restricted to Admin
router.post('/', authMiddleware, adminMiddleware, generateCertificate);

// Fetching lists requires basic auth
router.get('/', authMiddleware, getCertificates);
router.get('/student/:studentId', authMiddleware, getStudentCertificates);

// Getting individual certificate metadata is public to support external verification via QR
router.get('/:id', getCertificateById);

export default router;
