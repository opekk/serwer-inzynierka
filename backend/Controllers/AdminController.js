import mongoose from 'mongoose';
import Auction from '../Models/Auction.js';
import Bid from '../Models/Bid.js';
import User from '../Models/User.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/errorHandler.js';

// ============================================
// DASHBOARD & STATISTICS
// ============================================

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Parallel queries for better performance
    const [
      totalUsers,
      activeUsers,
      totalAuctions,
      activeAuctions,
      completedAuctions,
      totalBids,
      recentUsers,
      recentAuctions,
      topSellers,
      revenueData
    ] = await Promise.all([
      // User stats
      User.countDocuments(),
      User.countDocuments({ isActive: true }),

      // Auction stats
      Auction.countDocuments({ isDeleted: false }),
      Auction.countDocuments({ status: 'active', isDeleted: false }),
      Auction.countDocuments({ status: 'completed', isDeleted: false }),

      // Bid stats
      Bid.countDocuments(),

      // Recent users (last 7 days)
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),

      // Recent auctions (last 7 days)
      Auction.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isDeleted: false
      }),

      // Top sellers by total sales
      User.find({ 'stats.totalItemsSold': { $gt: 0 } })
        .select('username email stats.totalItemsSold stats.totalAuctionsCreated')
        .sort({ 'stats.totalItemsSold': -1 })
        .limit(5),

      // Revenue calculation (sum of all winning bids)
      Auction.aggregate([
        { $match: { status: 'completed', winnerId: { $ne: null } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$winningBid' },
            averagePrice: { $avg: '$winningBid' }
          }
        }
      ])
    ]);

    // Activity by day (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activityByDay = await Bid.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category distribution
    const categoryStats = await Auction.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalAuctions,
          activeAuctions,
          completedAuctions,
          totalBids,
          recentUsers,
          recentAuctions,
          totalRevenue: revenueData[0]?.totalRevenue || 0,
          averagePrice: revenueData[0]?.averagePrice || 0
        },
        topSellers,
        activityByDay,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania statystyk',
      error: error.message
    });
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Search by username or email
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) query.role = role;

    // Filter by active status
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      results: users.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania użytkowników',
      error: error.message
    });
  }
};

// Get user by ID with full details
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony'
      });
    }

    // Get user's auctions
    const auctions = await Auction.find({ seller: req.params.id, isDeleted: false })
      .select('title status currentPrice totalBids createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's bids
    const bids = await Bid.find({ bidder: req.params.id })
      .populate('auction', 'title status currentPrice')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        auctions,
        bids
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania użytkownika',
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const allowedFields = ['username', 'email', 'role', 'isActive', 'isEmailVerified'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Użytkownik zaktualizowany',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji użytkownika',
      error: error.message
    });
  }
};

// Ban/Unban user
export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isActive ? 'Użytkownik odblokowany' : 'Użytkownik zablokowany',
      data: { isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas zmiany statusu użytkownika',
      error: error.message
    });
  }
};

// Delete user (soft delete)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony'
      });
    }

    // Soft delete user's auctions
    await Auction.updateMany(
      { seller: req.params.id },
      { isDeleted: true }
    );

    // Deactivate user
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Użytkownik usunięty'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania użytkownika',
      error: error.message
    });
  }
};

// ============================================
// AUCTION MANAGEMENT
// ============================================

// Get all auctions (including deleted)
export const getAllAuctionsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      featured,
      includeDeleted = 'false',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Include deleted auctions if requested
    if (includeDeleted !== 'true') {
      query.isDeleted = false;
    }

    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auctions = await Auction.find(query)
      .populate('seller', 'username email')
      .populate('winnerId', 'username')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Auction.countDocuments(query);

    res.status(200).json({
      success: true,
      results: auctions.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania aukcji',
      error: error.message
    });
  }
};

// Force close auction
export const forceCloseAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Aukcja nie znaleziona'
      });
    }

    await auction.complete();

    res.status(200).json({
      success: true,
      message: 'Aukcja została zamknięta',
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas zamykania aukcji',
      error: error.message
    });
  }
};

// Hard delete auction
export const hardDeleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndDelete(req.params.id);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Aukcja nie znaleziona'
      });
    }

    // Delete associated bids
    await Bid.deleteMany({ auction: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Aukcja trwale usunięta'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania aukcji',
      error: error.message
    });
  }
};

// ============================================
// BID MANAGEMENT
// ============================================

// Get all bids with filters
export const getAllBidsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      auctionId,
      bidderId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (auctionId) query.auction = auctionId;
    if (bidderId) query.bidder = bidderId;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bids = await Bid.find(query)
      .populate('auction', 'title currentPrice endTime status')
      .populate('bidder', 'username email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Bid.countDocuments(query);

    res.status(200).json({
      success: true,
      results: bids.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania ofert',
      error: error.message
    });
  }
};

// Cancel bid (admin only)
export const cancelBidAdmin = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(req.params.id).session(session);

    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Oferta nie znaleziona'
      });
    }

    const { reason } = req.body;

    // Mark bid as cancelled
    bid.status = 'cancelled';
    bid.isWinning = false;
    await bid.save({ session });

    // If this was the winning bid, restore auction to previous state
    if (bid.isWinning) {
      const previousBid = await Bid.findOne({
        auction: bid.auction,
        _id: { $ne: bid._id },
        status: { $in: ['active', 'outbid'] }
      })
        .sort({ amount: -1 })
        .session(session);

      if (previousBid) {
        // Restore previous winning bid
        await Auction.findByIdAndUpdate(
          bid.auction,
          {
            currentPrice: previousBid.amount,
            winnerId: previousBid.bidder,
            $inc: { totalBids: -1 }
          },
          { session }
        );

        previousBid.isWinning = true;
        previousBid.status = 'active';
        await previousBid.save({ session });
      } else {
        // No previous bids, restore to starting price
        const auction = await Auction.findById(bid.auction).session(session);
        await Auction.findByIdAndUpdate(
          bid.auction,
          {
            currentPrice: auction.startingPrice,
            winnerId: null,
            $inc: { totalBids: -1 }
          },
          { session }
        );
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Oferta anulowana${reason ? ': ' + reason : ''}`,
      data: bid
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: 'Błąd podczas anulowania oferty',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// ============================================
// SYSTEM MANAGEMENT
// ============================================

// Run system cleanup
export const runSystemCleanup = async (req, res) => {
  try {
    const results = {
      expiredAuctionsClosed: 0,
      orphanedBidsRemoved: 0,
      inactiveUsersFound: 0
    };

    // Close expired auctions
    results.expiredAuctionsClosed = await Auction.closeExpiredAuctions();

    // Find orphaned bids (bids for deleted auctions)
    const orphanedBids = await Bid.deleteMany({
      auction: { $in: await Auction.find({ isDeleted: true }).distinct('_id') }
    });
    results.orphanedBidsRemoved = orphanedBids.deletedCount;

    // Count inactive users (not logged in for 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    results.inactiveUsersFound = await User.countDocuments({
      lastLoginAt: { $lt: ninetyDaysAgo },
      isActive: true
    });

    res.status(200).json({
      success: true,
      message: 'Czyszczenie systemu zakończone',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas czyszczenia systemu',
      error: error.message
    });
  }
};

// Get system health
export const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {}
    };

    // Check database connection
    try {
      await mongoose.connection.db.admin().ping();
      health.checks.database = 'ok';
    } catch (err) {
      health.checks.database = 'error';
      health.status = 'unhealthy';
    }

    // Check for stuck auctions
    const stuckAuctions = await Auction.countDocuments({
      status: 'active',
      endTime: { $lt: new Date() }
    });
    health.checks.stuckAuctions = stuckAuctions;
    if (stuckAuctions > 10) health.status = 'degraded';

    res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas sprawdzania stanu systemu',
      error: error.message
    });
  }
};
