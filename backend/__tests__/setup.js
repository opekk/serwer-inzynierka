/**
 * Global test setup file
 * This file runs before all tests
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.JWT_COOKIE_EXPIRES_IN = '7';
