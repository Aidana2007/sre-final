import express from 'express';
import { getProfile, updateProfile, getAllUsers, updateUserRole, deleteUser } from '../contollers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateUpdateProfile } from '../middleware/validation.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);

router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:userId/role', protect, authorize('admin'), updateUserRole);
router.delete('/:userId', protect, authorize('admin'), deleteUser);

export default router;