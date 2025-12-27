import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Nazwa użytkownika jest wymagana'],
    unique: true,
    trim: true,
    minlength: [3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki'],
    maxlength: [30, 'Nazwa użytkownika nie może przekraczać 30 znaków'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Nazwa użytkownika może zawierać tylko litery, cyfry, _ i -'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email jest wymagany'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'Podaj prawidłowy adres email'
    },
    index: true
  },
  password: {
    type: String,
    required: [true, 'Hasło jest wymagane'],
    minlength: [8, 'Hasło musi mieć co najmniej 8 znaków'],
    select: false // Domyślnie nie zwracaj hasła w zapytaniach
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'Imię nie może przekraczać 50 znaków']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Nazwisko nie może przekraczać 50 znaków']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Walidacja numeru telefonu (podstawowa)
        return !v || /^[+]?[\d\s-()]+$/.test(v);
      },
      message: 'Podaj prawidłowy numer telefonu'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Ocena nie może być mniejsza niż 0'],
    max: [5, 'Ocena nie może być większa niż 5']
  },
  ratingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin'],
      message: 'Rola musi być: user lub admin'
    },
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordChangedAt: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationTokenExpires: {
    type: Date,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  stats: {
    totalAuctionsCreated: {
      type: Number,
      default: 0
    },
    totalAuctionsWon: {
      type: Number,
      default: 0
    },
    totalBidsPlaced: {
      type: Number,
      default: 0
    },
    totalItemsSold: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true, // Automatycznie dodaje createdAt i updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============================================
// INDEXY
// ============================================
// Note: email and username indexes are defined in the schema with index: true
userSchema.index({ rating: -1 });
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUAL FIELDS
// ============================================

// Wirtualne pole dla pełnego imienia
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// ============================================
// MIDDLEWARE (HOOKS)
// ============================================

// Hashowanie hasła przed zapisem
userSchema.pre('save', async function(next) {
  // Tylko jeśli hasło zostało zmodyfikowane
  if (!this.isModified('password')) return next();
  
  try {
    // Hashowanie hasła z salt rounds = 12
    this.password = await bcrypt.hash(this.password, 12);
    
    // Ustawienie passwordChangedAt
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Odejmujemy 1s dla bezpieczeństwa JWT
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware przed usunięciem użytkownika - czyszczenie powiązanych danych
userSchema.pre('remove', async function(next) {
  try {
    // Usuń wszystkie aukcje użytkownika
    await this.model('Auction').deleteMany({ seller: this._id });

    // Usuń wszystkie bidy użytkownika
    await this.model('Bid').deleteMany({ bidder: this._id });

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

// Metoda do porównywania hasła
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Sprawdzenie czy hasło zostało zmienione po wydaniu tokena JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Metoda do pobierania publicznego profilu użytkownika
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    fullName: this.fullName,
    rating: this.rating,
    ratingCount: this.ratingCount,
    isVerified: this.isEmailVerified,
    memberSince: this.createdAt,
    stats: this.stats
  };
};

// Metoda do tworzenia tokenu weryfikacji email
userSchema.methods.createVerificationToken = function() {
  // Generuj losowy token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Zahashuj token i zapisz w bazie danych
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Ustaw czas wygaśnięcia (24 godziny)
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

  // Zwróć niezahaszowany token (do wysłania użytkownikowi)
  return verificationToken;
};

// Metoda do tworzenia tokenu resetowania hasła
userSchema.methods.createPasswordResetToken = function() {
  // Generuj losowy token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Zahashuj token i zapisz w bazie danych
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Ustaw czas wygaśnięcia (1 godzina)
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  // Zwróć niezahaszowany token (do wysłania użytkownikowi)
  return resetToken;
};

// ============================================
// STATIC METHODS
// ============================================

// Metoda statyczna do znajdowania użytkownika po email lub username
userSchema.statics.findByCredential = async function(credential) {
  const user = await this.findOne({
    $or: [
      { email: credential.toLowerCase() },
      { username: { $regex: new RegExp(`^${credential}$`, 'i') } }
    ]
  }).select('+password');

  return user;
};

// Metoda statyczna do pobierania najlepszych sprzedawców
userSchema.statics.getTopSellers = async function(limit = 10) {
  return await this.find({
    'stats.totalItemsSold': { $gt: 0 },
    isActive: true
  })
    .sort({ rating: -1, 'stats.totalItemsSold': -1 })
    .limit(limit)
    .select('username rating ratingCount stats.totalItemsSold');
};

// Metoda statyczna do wyszukiwania użytkowników
userSchema.statics.searchUsers = async function(query, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;
  
  const searchRegex = new RegExp(query, 'i');
  
  const users = await this.find({
    $or: [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex }
    ],
    isActive: true
  })
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .select('username fullName rating');
  
  const total = await this.countDocuments({
    $or: [
      { username: searchRegex },
      { firstName: searchRegex },
      { lastName: searchRegex }
    ],
    isActive: true
  });
  
  return {
    users,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

// ============================================
// MODEL EXPORT
// ============================================

const User = mongoose.model('User', userSchema);

export default User;