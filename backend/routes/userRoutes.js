import express from 'express';
import {
  register,
  login,
  getPublicProfile,
  getTopSellers,
  searchUsers,
  getMe,
  updateMe,
  updatePassword,
  updatePreferences,
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
router.get('/top-sellers', getTopSellers);
router.get('/search', searchUsers);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(protect);
router.get('/me', getMe);
router.patch('/me', updateMe);
router.patch('/me/password', updatePassword);
router.patch('/me/preferences', updatePreferences);
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
