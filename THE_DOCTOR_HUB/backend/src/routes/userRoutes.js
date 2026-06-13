import express from 'express';
import {
  getProfile, updateProfile, uploadProfilePicture, getAllUsers,
  suspendUser, activateUser, getUserById, deleteUser, assignRole,
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadProfile } from '../config/cloudinary.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile-picture', uploadProfile.single('profilePicture'), uploadProfilePicture);

// Admin routes
router.get('/', authorize('admin', 'super_admin'), getAllUsers);
router.get('/:id', authorize('admin', 'super_admin'), getUserById);
router.put('/:id/suspend', authorize('admin', 'super_admin'), suspendUser);
router.put('/:id/activate', authorize('admin', 'super_admin'), activateUser);
router.put('/:id/role', authorize('super_admin'), assignRole);
router.delete('/:id', authorize('super_admin'), deleteUser);

export default router;
