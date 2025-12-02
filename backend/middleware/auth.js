import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Brak autoryzacji. Zaloguj się aby uzyskać dostęp.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('+passwordChangedAt');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Użytkownik powiązany z tym tokenem nie istnieje.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'To konto zostało dezaktywowane.'
      });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Hasło zostało niedawno zmienione. Zaloguj się ponownie.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowy token. Zaloguj się ponownie.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token wygasł. Zaloguj się ponownie.'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Błąd autoryzacji',
      error: error.message
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Nie masz uprawnień do wykonania tej operacji.'
      });
    }
    next();
  };
};
