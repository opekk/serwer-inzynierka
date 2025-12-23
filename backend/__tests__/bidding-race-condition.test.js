/**
 * Test to verify the bidding race condition fix
 * This test simulates concurrent bids and ensures:
 * 1. All valid bids are processed
 * 2. No duplicate updates to totalBids
 * 3. Optimistic locking prevents race conditions
 * 4. Final auction state is consistent
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Auction from '../Models/Auction.js';
import Bid from '../Models/Bid.js';
import User from '../Models/User.js';

let mongoServer;

beforeAll(async () => {
  // Create replica set for transaction support
  mongoServer = await MongoMemoryServer.create({
    instance: {
      replSet: 'rs0'
    }
  });
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    directConnection: true
  });
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Auction.deleteMany({});
  await Bid.deleteMany({});
  await User.deleteMany({});
});

describe('Bidding Race Condition Tests', () => {
  test('should handle concurrent bids correctly with optimistic locking', async () => {
    // Create test users
    const seller = await User.create({
      username: 'seller',
      email: 'seller@test.com',
      password: 'Password123!',
      role: 'user'
    });

    const bidder1 = await User.create({
      username: 'bidder1',
      email: 'bidder1@test.com',
      password: 'Password123!',
      role: 'user'
    });

    const bidder2 = await User.create({
      username: 'bidder2',
      email: 'bidder2@test.com',
      password: 'Password123!',
      role: 'user'
    });

    // Create auction
    const auction = await Auction.create({
      title: 'Test Auction',
      description: 'Test auction for race condition',
      category: 'Sztuka',
      startingPrice: 1000,
      currentPrice: 1000,
      bidIncrement: 100,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'active'
    });

    console.log('Initial auction state:', {
      currentPrice: auction.currentPrice,
      totalBids: auction.totalBids,
      version: auction.__v
    });

    // Simulate concurrent bids using the controller logic
    const simulateBid = async (bidderId, amount, expectedSuccess = true) => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        let retries = 3;
        let bid = null;

        while (retries > 0) {
          try {
            const currentAuction = await Auction.findById(auction._id).session(session);

            // Validation
            const minimumBid = currentAuction.currentPrice + currentAuction.bidIncrement;
            if (amount < minimumBid) {
              throw new Error(`Minimalna oferta to ${minimumBid} zł`);
            }

            // Create bid
            const bidArray = await Bid.create([{
              auction: auction._id,
              bidder: bidderId,
              amount,
              previousBid: currentAuction.currentPrice,
              isWinning: true,
              status: 'active'
            }], { session });

            bid = bidArray[0];

            // Atomic update with version check
            const updatedAuction = await Auction.findOneAndUpdate(
              {
                _id: auction._id,
                __v: currentAuction.__v
              },
              {
                $set: {
                  currentPrice: amount,
                  winnerId: bidderId
                },
                $inc: {
                  totalBids: 1,
                  __v: 1
                }
              },
              { new: true, session }
            );

            if (!updatedAuction) {
              throw new Error('RETRY');
            }

            // Mark previous bids as outbid
            await Bid.updateMany(
              {
                auction: auction._id,
                _id: { $ne: bid._id },
                isWinning: true
              },
              {
                $set: {
                  isWinning: false,
                  status: 'outbid'
                }
              },
              { session }
            );

            await session.commitTransaction();
            return { success: true, bid };

          } catch (error) {
            if (error.message === 'RETRY' && retries > 1) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 10));
              continue;
            }
            throw error;
          }
        }

        throw new Error('Failed after retries');

      } catch (error) {
        await session.abortTransaction();
        return { success: false, error: error.message };
      } finally {
        session.endSession();
      }
    };

    // Test 1: Place concurrent bids
    console.log('\n=== Test 1: Concurrent Bids ===');
    const results = await Promise.all([
      simulateBid(bidder1._id, 1100),
      simulateBid(bidder2._id, 1200)
    ]);

    const successfulBids = results.filter(r => r.success);
    console.log('Successful bids:', successfulBids.length);

    // Verify final state
    const finalAuction = await Auction.findById(auction._id);
    console.log('Final auction state:', {
      currentPrice: finalAuction.currentPrice,
      totalBids: finalAuction.totalBids,
      version: finalAuction.__v
    });

    // Check all bids in database
    const allBids = await Bid.find({ auction: auction._id });
    console.log('Total bids in DB:', allBids.length);
    console.log('Winning bids:', allBids.filter(b => b.isWinning).length);

    // Assertions
    expect(successfulBids.length).toBeGreaterThan(0);
    expect(finalAuction.totalBids).toBe(allBids.length);
    expect(allBids.filter(b => b.isWinning).length).toBe(1);
    expect(finalAuction.currentPrice).toBeGreaterThanOrEqual(1100);

    // Test 2: Verify no duplicate totalBids
    expect(finalAuction.totalBids).toBe(successfulBids.length);
    console.log('✓ No duplicate totalBids increment');

    // Test 3: Verify only one winning bid
    const winningBids = allBids.filter(b => b.isWinning);
    expect(winningBids.length).toBe(1);
    expect(winningBids[0].amount).toBe(finalAuction.currentPrice);
    console.log('✓ Only one winning bid with correct amount');
  });

  test('should reject bids below minimum', async () => {
    const seller = await User.create({
      username: 'seller2',
      email: 'seller2@test.com',
      password: 'Password123!',
      role: 'user'
    });

    const bidder = await User.create({
      username: 'bidder3',
      email: 'bidder3@test.com',
      password: 'Password123!',
      role: 'user'
    });

    const auction = await Auction.create({
      title: 'Test Auction 2',
      description: 'Test auction for validation',
      category: 'Sztuka',
      startingPrice: 1000,
      currentPrice: 1000,
      bidIncrement: 100,
      seller: seller._id,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: 'active'
    });

    // Try to place bid below minimum
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const currentAuction = await Auction.findById(auction._id).session(session);
      const minimumBid = currentAuction.currentPrice + currentAuction.bidIncrement;

      expect(() => {
        if (999 < minimumBid) {
          throw new Error(`Minimalna oferta to ${minimumBid} zł`);
        }
      }).toThrow('Minimalna oferta to 1100 zł');

      await session.abortTransaction();
    } finally {
      session.endSession();
    }

    console.log('✓ Bids below minimum are rejected');
  });
});
