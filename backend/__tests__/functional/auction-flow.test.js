import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../Models/User.js';
import Auction from '../../Models/Auction.js';
import Bid from '../../Models/Bid.js';

let mongoServer;

describe('Auction Flow - Functional Tests', () => {
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
    await Bid.deleteMany({});
    await Auction.deleteMany({});
    await User.deleteMany({});
  });

  test('should create auction from user to listing', async () => {
    const seller = await User.create({
      username: 'seller1',
      email: 'seller@example.com',
      password: 'password123'
    });

    const auction = await Auction.create({
      title: 'Vintage Watch',
      description: 'Beautiful vintage watch from 1950s',
      category: 'Zegarki',
      startingPrice: 1000,
      currentPrice: 1000,
      bidIncrement: 100,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    expect(auction).toBeTruthy();
    expect(auction.currentPrice).toBe(1000);
    expect(auction.seller.toString()).toBe(seller._id.toString());
  });

  test('should handle complete bidding flow', async () => {
    const seller = await User.create({
      username: 'seller1',
      email: 'seller@example.com',
      password: 'password123'
    });

    const auction = await Auction.create({
      title: 'Vintage Watch',
      description: 'Beautiful vintage watch',
      category: 'Zegarki',
      startingPrice: 1000,
      currentPrice: 1000,
      bidIncrement: 100,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    const bidder1 = await User.create({
      username: 'bidder1',
      email: 'bidder1@example.com',
      password: 'password123'
    });

    const bidder2 = await User.create({
      username: 'bidder2',
      email: 'bidder2@example.com',
      password: 'password123'
    });

    const bid1 = await Bid.create({
      auction: auction._id,
      bidder: bidder1._id,
      amount: 1100,
      previousBid: auction.currentPrice
    });

    const bid2 = await Bid.create({
      auction: auction._id,
      bidder: bidder2._id,
      amount: 1200,
      previousBid: 1100
    });

    const allBids = await Bid.find({ auction: auction._id }).sort({ amount: -1 });
    expect(allBids.length).toBe(2);
    expect(allBids[0].amount).toBe(1200);
  });

  test('should handle auction completion with winner', async () => {
    const seller = await User.create({
      username: 'seller1',
      email: 'seller@example.com',
      password: 'password123'
    });

    const winner = await User.create({
      username: 'winner',
      email: 'winner@example.com',
      password: 'password123'
    });

    const auction = await Auction.create({
      title: 'Vintage Watch',
      description: 'Beautiful vintage watch',
      category: 'Zegarki',
      startingPrice: 1000,
      currentPrice: 1500,
      seller: seller._id,
      winnerId: winner._id,
      startTime: new Date(Date.now() - 10000),
      endTime: new Date(Date.now() + 1000),
      status: 'active'
    });

    await auction.complete();

    expect(auction.status).toBe('completed');
    expect(auction.winningBid).toBe(1500);
  });

  test('should allow users to watch and unwatch auctions', async () => {
    const user = await User.create({
      username: 'watcher',
      email: 'watcher@example.com',
      password: 'password123'
    });

    const seller = await User.create({
      username: 'seller',
      email: 'seller@example.com',
      password: 'password123'
    });

    const auction = await Auction.create({
      title: 'Vintage Watch',
      description: 'Beautiful vintage watch',
      category: 'Zegarki',
      startingPrice: 1000,
      currentPrice: 1000,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    await auction.addWatcher(user._id);
    expect(auction.watchers).toContainEqual(user._id);

    await auction.removeWatcher(user._id);
    expect(auction.watchers).not.toContainEqual(user._id);
  });

  test('should filter auctions by category', async () => {
    const seller = await User.create({
      username: 'seller',
      email: 'seller@example.com',
      password: 'password123'
    });

    await Auction.create({
      title: 'Vintage Watch',
      description: 'Beautiful watch',
      category: 'Zegarki',
      startingPrice: 1000,
      currentPrice: 1000,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    await Auction.create({
      title: 'Antique Vase',
      description: 'Beautiful vase',
      category: 'Antyki',
      startingPrice: 500,
      currentPrice: 500,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    const watchAuctions = await Auction.find({ category: 'Zegarki', status: 'active' });
    const antiqueAuctions = await Auction.find({ category: 'Antyki', status: 'active' });

    expect(watchAuctions.length).toBe(1);
    expect(antiqueAuctions.length).toBe(1);
  });

  test('should track user bidding statistics', async () => {
    const seller = await User.create({
      username: 'seller',
      email: 'seller@example.com',
      password: 'password123'
    });

    const bidder = await User.create({
      username: 'bidder',
      email: 'bidder@example.com',
      password: 'password123'
    });

    const auction = await Auction.create({
      title: 'Test Auction',
      description: 'Test description',
      category: 'Inne',
      startingPrice: 1000,
      currentPrice: 1000,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    await Bid.create({
      auction: auction._id,
      bidder: bidder._id,
      amount: 1100
    });

    await Bid.create({
      auction: auction._id,
      bidder: bidder._id,
      amount: 1200
    });

    const userBids = await Bid.countDocuments({ bidder: bidder._id });
    expect(userBids).toBe(2);
  });
});
