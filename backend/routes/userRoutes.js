import express from 'express';
import {
  register,
  login,
  getPublicProfile,
  getMe,
  updateMe,
  updatePassword,
  deleteMe,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../Controllers/UserController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

router.post('/register', register);
router.post('/login', login);

router.get('/profile/:id', getPublicProfile);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(protect);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/password', updatePassword);
router.delete('/me', deleteMe);

// ============================================
// ADMIN ROUTES (Admin role required)
// ============================================

router.use(restrictTo('admin'));
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
