import mongoose from 'mongoose';
import Bid from '../../Models/Bid.js';
import Auction from '../../Models/Auction.js';
import User from '../../Models/User.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';
import { createTestUser, createTestAuction, createTestBid } from '../helpers/testData.js';

describe('Bid Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('Schema Validation', () => {
    let seller, bidder, auction;

    beforeEach(async () => {
      seller = await User.create(createTestUser());
      bidder = await User.create(createTestUser({
        username: 'bidder',
        email: 'bidder@example.com'
      }));
      auction = await Auction.create(createTestAuction(seller._id));
    });

    test('should create a valid bid with required fields', async () => {
      const bidData = createTestBid(auction._id, bidder._id, 1100);
      const bid = await Bid.create(bidData);

      expect(bid.auction.toString()).toBe(auction._id.toString());
      expect(bid.bidder.toString()).toBe(bidder._id.toString());
      expect(bid.amount).toBe(1100);
    });

    test('should fail when required fields are missing', async () => {
      const invalidBid = new Bid({
        amount: 1000
      });

      await expect(invalidBid.save()).rejects.toThrow();
    });

    test('should fail when amount is negative', async () => {
      const bidData = createTestBid(auction._id, bidder._id, -100);
      const bid = new Bid(bidData);

      await expect(bid.save()).rejects.toThrow('Kwota licytacji nie może być ujemna');
    });

    test('should accept valid bid types', async () => {
      const types = ['manual', 'auto', 'buyNow'];

      for (const bidType of types) {
        const bidData = createTestBid(auction._id, bidder._id, 1100 + types.indexOf(bidType) * 100, { bidType });
        const bid = await Bid.create(bidData);
        expect(bid.bidType).toBe(bidType);
      }
    });

    test('should reject invalid bid type', async () => {
      const bidData = createTestBid(auction._id, bidder._id, 1100, { bidType: 'invalid' });
      const bid = new Bid(bidData);

      await expect(bid.save()).rejects.toThrow('Nieprawidłowy typ licytacji');
    });

    test('should reject invalid status', async () => {
      const bidData = createTestBid(auction._id, bidder._id, 1100, { status: 'invalid' });
      const bid = new Bid(bidData);

      await expect(bid.save()).rejects.toThrow('Nieprawidłowy status licytacji');
    });

    test('should default status to active', async () => {
      const bidData = createTestBid(auction._id, bidder._id, 1100);
      delete bidData.status;
      const bid = await Bid.create(bidData);

      expect(bid.status).toBe('active');
    });

    test('should default bidType to manual', async () => {
      const bidData = createTestBid(auction._id, bidder._id, 1100);
      delete bidData.bidType;
      const bid = await Bid.create(bidData);

      expect(bid.bidType).toBe('manual');
    });
  });

  describe('Pre-save Validation Middleware', () => {
    let seller, bidder, auction;

    beforeEach(async () => {
      seller = await User.create(createTestUser());
      bidder = await User.create(createTestUser({
        username: 'bidder',
        email: 'bidder@example.com'
      }));
      auction = await Auction.create(createTestAuction(seller._id));
    });

    test('should set previousBid when creating new bid', async () => {
      const initialPrice = auction.currentPrice;
      const bidData = createTestBid(auction._id, bidder._id, initialPrice + auction.bidIncrement);
      const bid = await Bid.create(bidData);

      expect(bid.previousBid).toBe(initialPrice);
    });

    test('should reject bid below minimum amount', async () => {
      const bidData = createTestBid(auction._id, bidder._id, auction.currentPrice + 50); // Less than bidIncrement

      await expect(Bid.create(bidData)).rejects.toThrow(/Minimalna oferta to/);
    });

    test('should reject bid on non-existent auction', async () => {
      const fakeAuctionId = new mongoose.Types.ObjectId();
      const bidData = createTestBid(fakeAuctionId, bidder._id, 1100);

      await expect(Bid.create(bidData)).rejects.toThrow('Aukcja nie istnieje');
    });

    test('should reject bid on inactive auction', async () => {
      auction.status = 'completed';
      await auction.save();

      const bidData = createTestBid(auction._id, bidder._id, auction.currentPrice + auction.bidIncrement);

      await expect(Bid.create(bidData)).rejects.toThrow('Aukcja nie jest aktywna');
    });

    test('should reject bid on expired auction', async () => {
      auction.endTime = new Date(Date.now() - 1000);
      await auction.save();

      const bidData = createTestBid(auction._id, bidder._id, auction.currentPrice + auction.bidIncrement);

      await expect(Bid.create(bidData)).rejects.toThrow('Aukcja już się zakończyła');
    });

    test('should reject bid from auction seller', async () => {
      const bidData = createTestBid(auction._id, seller._id, auction.currentPrice + auction.bidIncrement);

      await expect(Bid.create(bidData)).rejects.toThrow('Nie możesz licytować własnej aukcji');
    });
  });

  describe('Post-save Middleware', () => {
    let seller, bidder1, bidder2, auction;

    beforeEach(async () => {
      seller = await User.create(createTestUser());
      bidder1 = await User.create(createTestUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      }));
      bidder2 = await User.create(createTestUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      }));
      auction = await Auction.create(createTestAuction(seller._id));
    });

    test('should update auction currentPrice and winnerId', async () => {
      const bidAmount = auction.currentPrice + auction.bidIncrement;
      await Bid.create(createTestBid(auction._id, bidder1._id, bidAmount));

      const updatedAuction = await Auction.findById(auction._id);
      expect(updatedAuction.currentPrice).toBe(bidAmount);
      expect(updatedAuction.winnerId.toString()).toBe(bidder1._id.toString());
    });

    test('should increment auction totalBids', async () => {
      const initialBids = auction.totalBids;
      await Bid.create(createTestBid(auction._id, bidder1._id, auction.currentPrice + auction.bidIncrement));

      const updatedAuction = await Auction.findById(auction._id);
      expect(updatedAuction.totalBids).toBe(initialBids + 1);
    });

  });

  describe('Instance Methods', () => {
    let seller, bidder, auction, bid;

    beforeEach(async () => {
      seller = await User.create(createTestUser());
      bidder = await User.create(createTestUser({
        username: 'bidder',
        email: 'bidder@example.com'
      }));
      auction = await Auction.create(createTestAuction(seller._id));
      bid = await Bid.create(createTestBid(auction._id, bidder._id, 1100));
    });

  });

  describe('Virtual Fields', () => {
    let seller, bidder, auction;

    beforeEach(async () => {
      seller = await User.create(createTestUser());
      bidder = await User.create(createTestUser({
        username: 'bidder',
        email: 'bidder@example.com'
      }));
      auction = await Auction.create(createTestAuction(seller._id));
    });

    test('bidIncrease should return correct value', async () => {
      const bid = await Bid.create(createTestBid(auction._id, bidder._id, 1100));
      const bidUpdated = await Bid.findById(bid._id);

      expect(bidUpdated.bidIncrease).toBe(100); // 1100 - 1000
    });

  });

  describe('Static Methods', () => {
    let seller, bidder1, bidder2, auction;

    beforeEach(async () => {
      seller = await User.create(createTestUser());
      bidder1 = await User.create(createTestUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      }));
      bidder2 = await User.create(createTestUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      }));
      auction = await Auction.create(createTestAuction(seller._id));
    });

    describe('getAuctionBids', () => {
      test('should return all bids for an auction', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

        const bids = await Bid.getAuctionBids(auction._id);
        expect(bids.length).toBe(2);
      });

      test('should sort bids by createdAt descending by default', async () => {
        const bid1 = await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        await new Promise(resolve => setTimeout(resolve, 10));
        const bid2 = await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

        const bids = await Bid.getAuctionBids(auction._id);
        expect(bids[0]._id.toString()).toBe(bid2._id.toString());
        expect(bids[1]._id.toString()).toBe(bid1._id.toString());
      });

      test('should paginate results', async () => {
        for (let i = 0; i < 5; i++) {
          await Bid.create(createTestBid(auction._id, bidder1._id, 1100 + i * 100));
        }

        const page1 = await Bid.getAuctionBids(auction._id, { page: 1, limit: 2 });
        const page2 = await Bid.getAuctionBids(auction._id, { page: 2, limit: 2 });

        expect(page1.length).toBe(2);
        expect(page2.length).toBe(2);
      });
    });

    describe('getUserBids', () => {
      test('should return all bids for a user', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        await Bid.create(createTestBid(auction._id, bidder1._id, 1200));

        const bids = await Bid.getUserBids(bidder1._id);
        expect(bids.length).toBe(2);
      });

      test('should filter by status', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100, { status: 'active' }));
        await Bid.create(createTestBid(auction._id, bidder1._id, 1200, { status: 'won' }));

        const activeBids = await Bid.getUserBids(bidder1._id, { status: 'active' });
        expect(activeBids.length).toBe(1);
        expect(activeBids[0].status).toBe('active');
      });
    });

    describe('getHighestBid', () => {
      test('should return highest bid for auction', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        const highestBid = await Bid.create(createTestBid(auction._id, bidder2._id, 1500));

        const result = await Bid.getHighestBid(auction._id);
        expect(result._id.toString()).toBe(highestBid._id.toString());
        expect(result.amount).toBe(1500);
      });

      test('should return null when no bids exist', async () => {
        const result = await Bid.getHighestBid(auction._id);
        expect(result).toBeNull();
      });
    });

    describe('getUserActiveBids', () => {
      test('should return only active winning bids', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100));

        const activeBids = await Bid.getUserActiveBids(bidder1._id);
        expect(activeBids.length).toBe(1);
        expect(activeBids[0].isWinning).toBe(true);
        expect(activeBids[0].status).toBe('active');
      });

      test('should not return outbid bids', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

        const activeBids = await Bid.getUserActiveBids(bidder1._id);
        expect(activeBids.length).toBe(0);
      });
    });

    describe('markLostBids', () => {
      test('should mark losing bids as lost', async () => {
        const bid1 = await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        const bid2 = await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

        await Bid.markLostBids(auction._id, bidder2._id);

        const updatedBid1 = await Bid.findById(bid1._id);
        const updatedBid2 = await Bid.findById(bid2._id);

        expect(updatedBid1.status).toBe('lost');
        expect(updatedBid1.isWinning).toBe(false);
        expect(updatedBid2.status).toBe('outbid'); // Not changed
      });
    });

    describe('getAuctionBidStats', () => {
      test('should return correct statistics', async () => {
        await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
        await Bid.create(createTestBid(auction._id, bidder2._id, 1200));
        await Bid.create(createTestBid(auction._id, bidder1._id, 1300));

        const stats = await Bid.getAuctionBidStats(auction._id);

        expect(stats.totalBids).toBe(3);
        expect(stats.uniqueBidders).toBe(2);
        expect(stats.highestBid).toBe(1300);
        expect(stats.lowestBid).toBe(1100);
        expect(stats.averageBid).toBe(1200);
      });

      test('should return zero stats when no bids exist', async () => {
        const stats = await Bid.getAuctionBidStats(auction._id);

        expect(stats.totalBids).toBe(0);
        expect(stats.uniqueBidders).toBe(0);
        expect(stats.highestBid).toBe(0);
        expect(stats.lowestBid).toBe(0);
        expect(stats.averageBid).toBe(0);
      });
    });
  });
});
