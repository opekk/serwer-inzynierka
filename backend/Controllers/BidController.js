import Bid from '../Models/Bid.js';
import Auction from '../Models/Auction.js';

// ============================================
// PUBLIC ENDPOINTS (No authentication required)
// ============================================

// Pobierz najwyższą ofertę dla aukcji
export const getHighestBid = async (req, res) => {
  try {
    const bid = await Bid.getHighestBid(req.params.auctionId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Brak ofert dla tej aukcji'
      });
    }

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania najwyższej oferty',
      error: error.message
    });
  }
};

// Pobierz statystyki bidowania dla aukcji
export const getAuctionBidStats = async (req, res) => {
  try {
    const stats = await Bid.getAuctionBidStats(req.params.auctionId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania statystyk',
      error: error.message
    });
  }
};

// ============================================
// PROTECTED ENDPOINTS (Authentication required)
// ============================================

// Pobierz historię ofert użytkownika
export const getMyBids = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const bids = await Bid.getUserBids(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      sortOrder
    });

    const total = await Bid.countDocuments({ bidder: req.user._id });

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
      message: 'Błąd podczas pobierania historii ofert',
      error: error.message
    });
  }
};

// Pobierz aktywne oferty użytkownika
export const getMyActiveBids = async (req, res) => {
  try {
    const bids = await Bid.getUserActiveBids(req.user._id);

    res.status(200).json({
      success: true,
      results: bids.length,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania aktywnych ofert',
      error: error.message
    });
  }
};

// Anuluj ofertę (tylko w specjalnych przypadkach, np. przez admina)
export const cancelBid = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono oferty'
      });
    }

    // Sprawdź czy użytkownik jest właścicielem oferty lub adminem
    if (!bid.bidder.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nie masz uprawnień do anulowania tej oferty'
      });
    }

    // Normalnie nie pozwalamy na anulowanie ofert - tylko admin może
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Oferty nie mogą być anulowane przez użytkowników'
      });
    }

    const { reason } = req.body;
    await bid.cancel(reason);

    res.status(200).json({
      success: true,
      message: 'Oferta została anulowana',
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas anulowania oferty',
      error: error.message
    });
  }
};

// ============================================
// ADMIN ENDPOINTS (Admin role required)
// ============================================

// Pobierz wszystkie oferty (dla admina)
export const getAllBids = async (req, res) => {
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
      .populate('bidder', 'username email rating')
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

// Pobierz szczegóły oferty (dla admina)
export const getBidById = async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('auction', 'title currentPrice endTime status seller')
      .populate('bidder', 'username email rating avatar');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono oferty'
      });
    }

    res.status(200).json({
      success: true,
      data: bid
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania oferty',
      error: error.message
    });
  }
};
