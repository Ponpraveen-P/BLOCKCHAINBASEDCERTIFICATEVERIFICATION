import express from 'express';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} from '../controllers/student.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Apply authMiddleware to all routes here
router.use(authMiddleware);

router.post('/', adminMiddleware, createStudent);
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/:id', adminMiddleware, updateStudent);
router.delete('/:id', adminMiddleware, deleteStudent);

export default router;
