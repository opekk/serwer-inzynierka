import mongoose from 'mongoose';

export const createTestUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword123',
  role: 'user',
  stats: {
    totalAuctionsCreated: 0,
    totalItemsSold: 0,
    totalAuctionsWon: 0,
    totalBidsPlaced: 0
  },
  ...overrides
});

export const createTestAuction = (sellerId, overrides = {}) => ({
  title: 'Test Auction Item',
  description: 'This is a test auction description with enough characters to pass validation',
  category: 'Sztuka',
  images: ['https://example.com/image1.jpg'],
  startingPrice: 1000,
  currentPrice: 1000,
  bidIncrement: 100,
  seller: sellerId,
  startTime: new Date(),
  endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  status: 'active',
  ...overrides
});

export const createTestBid = (auctionId, bidderId, amount, overrides = {}) => ({
  auction: auctionId,
  bidder: bidderId,
  amount,
  bidType: 'manual',
  status: 'active',
  ...overrides
});

export const createTestAdmin = (overrides = {}) => createTestUser({
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin',
  ...overrides
});
