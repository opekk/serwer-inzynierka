import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserBan,
  deleteUser,
  getAllAuctionsAdmin,
  forceCloseAuction,
  hardDeleteAuction,
  getAllBidsAdmin,
  cancelBidAdmin,
  runSystemCleanup,
  getSystemHealth
} from '../Controllers/AdminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// ============================================
// DASHBOARD & STATISTICS
// ============================================
router.get('/dashboard/stats', getDashboardStats);
router.get('/system/health', getSystemHealth);
router.post('/system/cleanup', runSystemCleanup);

// ============================================
// USER MANAGEMENT
// ============================================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/toggle-ban', toggleUserBan);
router.delete('/users/:id', deleteUser);

// ============================================
// AUCTION MANAGEMENT
// ============================================
router.get('/auctions', getAllAuctionsAdmin);
router.post('/auctions/:id/close', forceCloseAuction);
router.delete('/auctions/:id/hard-delete', hardDeleteAuction);

// ============================================
// BID MANAGEMENT
// ============================================
router.get('/bids', getAllBidsAdmin);
router.post('/bids/:id/cancel', cancelBidAdmin);

export default router;
