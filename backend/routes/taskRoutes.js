import express from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask, assignTask, getTaskStats } from '../contollers/taskController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateTask } from '../middleware/validation.js';

const router = express.Router();

router.get('/stats', protect, getTaskStats);
router.post('/', protect, validateTask, createTask);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('admin', 'user'), deleteTask);
router.post('/:id/assign', protect, authorize('admin'), assignTask);

export default router;