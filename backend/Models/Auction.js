import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tytuł aukcji jest wymagany'],
    trim: true,
    minlength: [3, 'Tytuł musi mieć co najmniej 3 znaki'],
    maxlength: [100, 'Tytuł nie może przekraczać 100 znaków']
  },
  description: {
    type: String,
    required: [true, 'Opis aukcji jest wymagany'],
    trim: true,
    minlength: [10, 'Opis musi mieć co najmniej 10 znaków'],
    maxlength: [5000, 'Opis nie może przekraczać 5000 znaków']
  },
  category: {
    type: String,
    required: [true, 'Kategoria jest wymagana'],
    enum: {
      values: [
        'Sztuka',
        'Antyki',
        'Biżuteria',
        'Monety i Banknoty',
        'Książki',
        'Militaria',
        'Meble',
        'Porcelana i Ceramika',
        'Zegarki',
        'Instrumenty Muzyczne',
        'Elektronika',
        'Inne'
      ],
      message: 'Nieprawidłowa kategoria'
    }
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Nieprawidłowy URL obrazu'
    }
  }],
  model3D: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /\.(obj|gltf|glb|fbx)$/i.test(v);
      },
      message: 'Nieprawidłowy format modelu 3D (dozwolone: obj, gltf, glb, fbx)'
    }
  },
  startingPrice: {
    type: Number,
    required: [true, 'Cena wywoławcza jest wymagana'],
    min: [0, 'Cena wywoławcza nie może być ujemna']
  },
  currentPrice: {
    type: Number,
    required: true,
    min: [0, 'Aktualna cena nie może być ujemna']
  },
  bidIncrement: {
    type: Number,
    required: [true, 'Minimalna wysokość postąpienia jest wymagana'],
    min: [1, 'Minimalna wysokość postąpienia musi być większa od 0'],
    default: 100
  },
  reservePrice: {
    type: Number,
    min: [0, 'Cena minimalna nie może być ujemna'],
    validate: {
      validator: function(v) {
        return !v || v >= this.startingPrice;
      },
      message: 'Cena minimalna musi być wyższa lub równa cenie wywoławczej'
    }
  },
  buyNowPrice: {
    type: Number,
    min: [0, 'Cena Kup Teraz nie może być ujemna'],
    validate: {
      validator: function(v) {
        return !v || v > this.startingPrice;
      },
      message: 'Cena Kup Teraz musi być wyższa od ceny wywoławczej'
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sprzedawca jest wymagany'],
    index: true
  },
  startTime: {
    type: Date,
    required: [true, 'Data rozpoczęcia aukcji jest wymagana'],
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'Data zakończenia aukcji jest wymagana'],
    validate: {
      validator: function(v) {
        return v > this.startTime;
      },
      message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia'
    },
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'completed', 'cancelled'],
      message: 'Nieprawidłowy status aukcji'
    },
    default: 'draft',
    index: true
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  winningBid: {
    type: Number,
    default: null
  },
  totalBids: {
    type: Number,
    default: 0,
    min: 0
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  watchersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  auctionHouse: {
    name: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  technicalDetails: {
    type: Map,
    of: String
  },
  condition: {
    type: String,
    enum: {
      values: ['Nowy', 'Bardzo dobry', 'Dobry', 'Zadowalający', 'Do renowacji'],
      message: 'Nieprawidłowy stan przedmiotu'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  optimisticConcurrency: true  // Enable optimistic locking for race condition prevention
});

// ============================================
// INDEXY
// ============================================
auctionSchema.index({ seller: 1, status: 1 });
auctionSchema.index({ endTime: 1, status: 1 });
auctionSchema.index({ category: 1, status: 1 });
auctionSchema.index({ featured: 1, status: 1 });
auctionSchema.index({ currentPrice: 1 });
auctionSchema.index({ createdAt: -1 });
auctionSchema.index({ title: 'text', description: 'text' });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Bidy dla aukcji
auctionSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'auction'
});

// Czas pozostały do końca aukcji (w milisekundach)
auctionSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const remaining = this.endTime - Date.now();
  return remaining > 0 ? remaining : 0;
});

// Czy aukcja jest aktywna
auctionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.endTime > Date.now();
});

// Czy aukcja osiągnęła cenę minimalną
auctionSchema.virtual('reserveMet').get(function() {
  if (!this.reservePrice) return true;
  return this.currentPrice >= this.reservePrice;
});

// ============================================
// MIDDLEWARE (HOOKS)
// ============================================

// Przed zapisem - ustawienie currentPrice jeśli nie ma
auctionSchema.pre('save', function(next) {
  if (this.isNew && !this.currentPrice) {
    this.currentPrice = this.startingPrice;
  }
  next();
});

// Automatyczne ustawienie statusu na active gdy nadejdzie startTime
auctionSchema.pre('save', function(next) {
  const now = Date.now();

  if (this.status === 'draft' && this.startTime <= now && this.endTime > now) {
    this.status = 'active';
  }

  if (this.status === 'active' && this.endTime <= now) {
    this.status = 'completed';
  }

  next();
});

// Aktualizacja watchersCount
auctionSchema.pre('save', function(next) {
  if (this.isModified('watchers')) {
    this.watchersCount = this.watchers.length;
  }
  next();
});

// Middleware przed usunięciem aukcji - usuwanie powiązanych bidów
auctionSchema.pre('remove', async function(next) {
  try {
    await this.model('Bid').deleteMany({ auction: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

// Metoda do zwiększenia liczby wyświetleń
auctionSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save({ validateBeforeSave: false });
  return this.views;
};

// Metoda do dodania obserwującego
auctionSchema.methods.addWatcher = async function(userId) {
  if (!this.watchers.includes(userId)) {
    this.watchers.push(userId);
    await this.save({ validateBeforeSave: false });
  }
  return this;
};

// Metoda do usunięcia obserwującego
auctionSchema.methods.removeWatcher = async function(userId) {
  this.watchers = this.watchers.filter(id => !id.equals(userId));
  await this.save({ validateBeforeSave: false });
  return this;
};

// NOTE: placeBid method removed - logic moved to controller for better transaction control
// This prevents race conditions and ensures atomic operations

// Metoda do zakończenia aukcji
auctionSchema.methods.complete = async function() {
  if (this.status === 'completed') {
    return this;
  }

  this.status = 'completed';

  if (this.winnerId) {
    this.winningBid = this.currentPrice;

    // Aktualizacja statystyk użytkowników
    const User = this.model('User');

    // Aktualizacja sprzedawcy
    await User.findByIdAndUpdate(this.seller, {
      $inc: { 'stats.totalItemsSold': 1 }
    });

    // Aktualizacja zwycięzcy
    await User.findByIdAndUpdate(this.winnerId, {
      $inc: { 'stats.totalAuctionsWon': 1 }
    });
  }

  await this.save();
  return this;
};

// Metoda do anulowania aukcji
auctionSchema.methods.cancel = async function(reason) {
  if (this.status === 'completed') {
    throw new Error('Nie można anulować zakończonej aukcji');
  }

  this.status = 'cancelled';
  await this.save();

  return this;
};

// Metoda do soft delete
auctionSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  await this.save({ validateBeforeSave: false });
  return this;
};

// ============================================
// STATIC METHODS
// ============================================

// Metoda do znajdowania aktywnych aukcji
auctionSchema.statics.findActive = function(options = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    sortBy = 'endTime',
    sortOrder = 'asc'
  } = options;

  const query = {
    status: 'active',
    endTime: { $gt: Date.now() },
    isDeleted: false
  };

  if (category) query.category = category;
  if (minPrice) query.currentPrice = { ...query.currentPrice, $gte: minPrice };
  if (maxPrice) query.currentPrice = { ...query.currentPrice, $lte: maxPrice };

  return this.find(query)
    .populate('seller', 'username rating avatar')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Metoda do wyszukiwania aukcji
auctionSchema.statics.searchAuctions = async function(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    status = 'active',
    sortBy = 'relevance',
    sortOrder = 'desc'
  } = options;

  const searchQuery = {
    $text: { $search: query },
    status,
    isDeleted: false
  };

  if (status === 'active') {
    searchQuery.endTime = { $gt: Date.now() };
  }

  if (category) searchQuery.category = category;
  if (minPrice) searchQuery.currentPrice = { ...searchQuery.currentPrice, $gte: minPrice };
  if (maxPrice) searchQuery.currentPrice = { ...searchQuery.currentPrice, $lte: maxPrice };

  const sortOptions = sortBy === 'relevance'
    ? { score: { $meta: 'textScore' } }
    : { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const auctions = await this.find(searchQuery, { score: { $meta: 'textScore' } })
    .populate('seller', 'username rating avatar')
    .sort(sortOptions)
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(searchQuery);

  return {
    auctions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// Metoda do automatycznego zamykania zakończonych aukcji
auctionSchema.statics.closeExpiredAuctions = async function() {
  const expiredAuctions = await this.find({
    status: 'active',
    endTime: { $lte: Date.now() }
  });

  for (const auction of expiredAuctions) {
    await auction.complete();
  }

  return expiredAuctions.length;
};

// Metoda do pobierania polecanych aukcji
auctionSchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    status: 'active',
    featured: true,
    endTime: { $gt: Date.now() },
    isDeleted: false
  })
    .populate('seller', 'username rating avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ============================================
// MODEL EXPORT
// ============================================

const Auction = mongoose.model('Auction', auctionSchema);

export default Auction;
