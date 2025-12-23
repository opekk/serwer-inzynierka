import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../Models/User.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/errorHandler.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res, message = 'Sukces') => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: { user }
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Podaj wymagane pola: username, email i password'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? 'Użytkownik z tym adresem email juz istnieje'
          : 'Nazwa użytkownika jest juz zajęta'
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone
    });

    const verificationToken = newUser.createVerificationToken();
    await newUser.save({ validateBeforeSave: false });

    console.log('Verification token:', verificationToken);

    createSendToken(newUser, 201, res, 'Konto zostało utworzone pomyślnie');
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Nazwa użytkownika'} jest juz zajęta`
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    return sendErrorResponse(res, 500, 'Błąd podczas rejestracji', error);
  }
};

export const login = async (req, res) => {
  try {
    const { credential, password } = req.body;

    if (!credential || !password) {
      return res.status(400).json({
        success: false,
        message: 'Podaj email/username i hasło'
      });
    }

    const user = await User.findByCredential(credential);

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe dane logowania'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'To konto zostało dezaktywowane'
      });
    }

    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    createSendToken(user, 200, res, 'Zalogowano pomyślnie');
  } catch (error) {
    return sendErrorResponse(res, 500, 'Błąd podczas logowania', error);
  }
};

// Email verification removed - not needed for this application

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Podaj adres email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika z tym adresem email'
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset email here
    console.log('Reset token:', resetToken);

    res.status(200).json({
      success: true,
      message: 'Token resetowania hasła zostaB wysłany na email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas wysyBania tokenu resetowania',
      error: error.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token resetowania jest nieprawidłowy lub wygasł'
      });
    }

    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Podaj hasło i potwierdzenie hasła'
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Hasła nie są identyczne'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res, 'Hasło zostało zresetowane pomyślnie');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas resetowania hasBa',
      error: error.message
    });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika'
      });
    }

    const publicProfile = user.getPublicProfile();

    res.status(200).json({
      success: true,
      data: publicProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania profilu',
      error: error.message
    });
  }
};

export const getTopSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topSellers = await User.getTopSellers(limit);

    res.status(200).json({
      success: true,
      results: topSellers.length,
      data: topSellers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania najlepszych sprzedawców',
      error: error.message
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q, page, limit, sortBy, sortOrder } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Podaj frazę wyszukiwania (q)'
      });
    }

    const result = await User.searchUsers(q, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas wyszukiwania użytkowników',
      error: error.message
    });
  }
};

// ============================================
// PROTECTED ENDPOINTS (Authentication required)
// ============================================

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania profilu',
      error: error.message
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Uzyj endpointu /updatePassword do zmiany hasła'
      });
    }

    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'avatar'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profil zaktualizowany pomyślnie',
      data: { user }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji profilu',
      error: error.message
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, passwordConfirm } = req.body;

    if (!currentPassword || !newPassword || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Podaj obecne hasło, nowe hasło i potwierdzenie'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Obecne hasło jest nieprawidłowe'
      });
    }

    if (newPassword !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: 'Nowe hasła nie są identyczne'
      });
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res, 'Hasło zostało zmienione pomyślnie');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Błąd podczas zmiany hasła',
      error: error.message
    });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const allowedPreferences = ['emailNotifications', 'smsNotifications', 'newsletterSubscription'];
    const updates = { preferences: {} };

    Object.keys(req.body).forEach(key => {
      if (allowedPreferences.includes(key)) {
        updates.preferences[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Preferencje zaktualizowane pomyślnie',
      data: { preferences: user.preferences }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji preferencji',
      error: error.message
    });
  }
};

export const deleteMe = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Podaj hasło aby potwierdził usunięcie konta'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'NieprawidBowe hasło'
      });
    }

    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Konto zostało dezaktywowane pomy[lnie'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania konta',
      error: error.message
    });
  }
};

// ============================================
// ADMIN ENDPOINTS (Admin role required)
// ============================================

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      results: users.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
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

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania użytkownika',
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Nie mozna bezpośrednio aktualizować hasła'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Użytkownik zaktualizowany pomyślnie',
      data: { user }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji użytkownika',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono użytkownika'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Użytkownik usunięty pomyślnie'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania użytkownika',
      error: error.message
    });
  }
};
