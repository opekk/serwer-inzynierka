import jwt from 'jsonwebtoken';
import User from '../../Models/User.js';

// Generate JWT token for testing
export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// Create authenticated user and return token
export const createAuthenticatedUser = async (userData = {}) => {
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    ...userData
  });

  const token = generateToken(user._id);

  return { user, token };
};

// Create admin user and return token
export const createAuthenticatedAdmin = async (adminData = {}) => {
  return createAuthenticatedUser({
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    ...adminData
  });
};
