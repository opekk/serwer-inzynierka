import express from 'express';
import {
  getHighestBid,
  getAuctionBidStats,
  getMyBids,
  getMyActiveBids,
  cancelBid,
  getAllBids,
  getBidById
} from '../Controllers/BidController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

router.get('/auction/:auctionId/highest', getHighestBid);
router.get('/auction/:auctionId/stats', getAuctionBidStats);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(protect);

router.get('/me', getMyBids);
router.get('/me/active', getMyActiveBids);
router.patch('/:id/cancel', cancelBid);

// ============================================
// ADMIN ROUTES (Admin role required)
// ============================================

router.use(restrictTo('admin'));

router.get('/', getAllBids);
router.get('/:id', getBidById);

export default router;
