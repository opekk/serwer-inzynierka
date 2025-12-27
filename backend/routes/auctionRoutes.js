import express from 'express';
import {
  getAllAuctions,
  getAuctionById,
  searchAuctions,
  getFeaturedAuctions,
  getCategories,
  getAuctionBids,
  createAuction,
  updateAuction,
  deleteAuction,
  placeBid,
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  getMyAuctions,
  getMyBids
} from '../Controllers/AuctionController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

router.get('/', getAllAuctions);
router.get('/search', searchAuctions);
router.get('/featured', getFeaturedAuctions);
router.get('/categories', getCategories);
router.get('/:id/bids', getAuctionBids);
router.get('/:id', getAuctionById); // Single auction - public access

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

router.use(protect);

// User-specific routes (MUST come before other routes)
router.get('/me/watchlist', getMyWatchlist);
router.get('/me/auctions', getMyAuctions);
router.get('/me/bids', getMyBids);

// Tworzenie i zarządzanie aukcjami
router.post('/', createAuction);
router.patch('/:id', updateAuction);
router.delete('/:id', deleteAuction);

// Licytacja
router.post('/:id/bid', placeBid);

// Obserwowane aukcje
router.post('/:id/watch', addToWatchlist);
router.delete('/:id/watch', removeFromWatchlist);

// ============================================
// ADMIN ROUTES (Admin role required)
// ============================================

router.use(restrictTo('admin'));

router.post('/admin/close-expired', closeExpiredAuctions);
router.patch('/:id/featured', setFeatured);

export default router;
