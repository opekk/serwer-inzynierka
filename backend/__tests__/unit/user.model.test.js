import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../Models/User.js';

let mongoServer;

describe('User Model - Unit Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Creation and Validation', () => {
    test('should create a valid user with required fields', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const user = await User.create(userData);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.password).not.toBe('password123'); // Should be hashed
      expect(user.role).toBe('user');
    });

    test('should fail when required fields are missing', async () => {
      const invalidUser = new User({});
      await expect(invalidUser.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidEmail = new User({
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123'
      });

      await expect(invalidEmail.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    test('should hash password before saving', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(user.password).not.toBe('password123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    test('comparePassword should validate correct password', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const userWithPassword = await User.findById(user._id).select('+password');
      const isValid = await userWithPassword.comparePassword('password123');

      expect(isValid).toBe(true);
    });
  });

  describe('User Methods', () => {
    test('getPublicProfile should return sanitized user data', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      const publicProfile = user.getPublicProfile();

      expect(publicProfile).toHaveProperty('username', 'testuser');
      expect(publicProfile).not.toHaveProperty('password');
      expect(publicProfile).not.toHaveProperty('email');
    });

    test('findByCredential should find user by email or username', async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      const userByEmail = await User.findByCredential('test@example.com');
      const userByUsername = await User.findByCredential('testuser');

      expect(userByEmail).toBeTruthy();
      expect(userByUsername).toBeTruthy();
    });
  });
});
