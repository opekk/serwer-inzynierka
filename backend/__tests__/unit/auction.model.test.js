import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Auction from '../../Models/Auction.js';
import User from '../../Models/User.js';

let mongoServer;
let testUser;

describe('Auction Model - Unit Tests', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await Auction.deleteMany({});
  });

  describe('Auction Creation and Validation', () => {
    test('should create a valid auction with required fields', async () => {
      const auction = await Auction.create({
        title: 'Test Auction Item',
        description: 'This is a test auction description',
        category: 'Sztuka',
        startingPrice: 100,
        currentPrice: 100,
        seller: testUser._id,
        startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Future start time for draft status
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      expect(auction.title).toBe('Test Auction Item');
      expect(auction.currentPrice).toBe(100);
      expect(auction.status).toBe('draft');
    });

    test('should validate category enum', async () => {
      const invalidCategory = new Auction({
        title: 'Test Auction',
        description: 'Valid description',
        category: 'InvalidCategory',
        startingPrice: 100,
        currentPrice: 100,
        seller: testUser._id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      await expect(invalidCategory.save()).rejects.toThrow();
    });
  });

  describe('Auction Methods', () => {
    test('incrementViews should increase view count', async () => {
      const auction = await Auction.create({
        title: 'Test Auction',
        description: 'Valid description',
        category: 'Sztuka',
        startingPrice: 100,
        currentPrice: 100,
        seller: testUser._id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const initialViews = auction.views;
      await auction.incrementViews();

      expect(auction.views).toBe(initialViews + 1);
    });

    test('complete should update auction status to completed', async () => {
      const auction = await Auction.create({
        title: 'Test Auction',
        description: 'Valid description',
        category: 'Sztuka',
        startingPrice: 100,
        currentPrice: 100,
        seller: testUser._id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active'
      });

      await auction.complete();

      expect(auction.status).toBe('completed');
    });

    test('getFeatured should return only featured auctions', async () => {
      await Auction.create({
        title: 'Featured Auction',
        description: 'Valid description',
        category: 'Sztuka',
        startingPrice: 100,
        currentPrice: 100,
        seller: testUser._id,
        startTime: new Date(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        featured: true
      });

      const featured = await Auction.getFeatured(10);

      expect(featured.length).toBe(1);
      expect(featured[0].featured).toBe(true);
    });
  });
});
