import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: [true, 'ID aukcji jest wymagane'],
    index: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID licytującego jest wymagane'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Kwota licytacji jest wymagana'],
    min: [0, 'Kwota licytacji nie może być ujemna']
  },
  previousBid: {
    type: Number,
    default: null
  },
  bidType: {
    type: String,
    enum: {
      values: ['manual', 'auto', 'buyNow'],
      message: 'Nieprawidłowy typ licytacji'
    },
    default: 'manual'
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'outbid', 'won', 'lost', 'cancelled'],
      message: 'Nieprawidłowy status licytacji'
    },
    default: 'active'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXY
// ============================================
bidSchema.index({ auction: 1, bidder: 1 });
bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });
bidSchema.index({ auction: 1, isWinning: 1 });
bidSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Wzrost oferty w stosunku do poprzedniej
bidSchema.virtual('bidIncrease').get(function() {
  if (!this.previousBid) return this.amount;
  return this.amount - this.previousBid;
});

// ============================================
// MIDDLEWARE (HOOKS)
// ============================================

// NOTE: Pre-save and post-save middleware removed to prevent race conditions
// All validation and auction updates are now handled atomically in the controller
// using transactions and optimistic locking

// ============================================
// INSTANCE METHODS
// ============================================

// Metoda do anulowania oferty (tylko w specjalnych przypadkach)
bidSchema.methods.cancel = async function(reason) {
  if (this.status !== 'active') {
    throw new Error('Oferta nie jest aktywna');
  }

  this.status = 'cancelled';
  this.isWinning = false;
  await this.save();

  return this;
};

// ============================================
// STATIC METHODS
// ============================================

// Metoda do pobierania historii licytacji dla aukcji
bidSchema.statics.getAuctionBids = function(auctionId, options = {}) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  return this.find({ auction: auctionId })
    .populate('bidder', 'username rating')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Metoda do pobierania bidów użytkownika
bidSchema.statics.getUserBids = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = { bidder: userId };
  if (status) query.status = status;

  return this.find(query)
    .populate('auction', 'title currentPrice endTime status images')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Metoda do pobierania najwyższej oferty dla aukcji
bidSchema.statics.getHighestBid = function(auctionId) {
  return this.findOne({ auction: auctionId })
    .sort({ amount: -1 })
    .populate('bidder', 'username rating');
};

// Metoda do pobierania aktywnych bidów użytkownika
bidSchema.statics.getUserActiveBids = function(userId) {
  return this.find({
    bidder: userId,
    isWinning: true,
    status: 'active'
  })
    .populate('auction', 'title currentPrice endTime status images')
    .sort({ createdAt: -1 });
};

// Metoda do statystyk bidowania dla aukcji
bidSchema.statics.getAuctionBidStats = async function(auctionId) {
  const stats = await this.aggregate([
    { $match: { auction: new mongoose.Types.ObjectId(auctionId) } },
    {
      $group: {
        _id: null,
        totalBids: { $sum: 1 },
        uniqueBidders: { $addToSet: '$bidder' },
        averageBid: { $avg: '$amount' },
        highestBid: { $max: '$amount' },
        lowestBid: { $min: '$amount' }
      }
    }
  ]);

  if (stats.length === 0) {
    return {
      totalBids: 0,
      uniqueBidders: 0,
      averageBid: 0,
      highestBid: 0,
      lowestBid: 0
    };
  }

  return {
    ...stats[0],
    uniqueBidders: stats[0].uniqueBidders.length
  };
};

// ============================================
// MODEL EXPORT
// ============================================

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
