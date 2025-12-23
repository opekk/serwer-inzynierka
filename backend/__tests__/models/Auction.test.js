import mongoose from 'mongoose';
import Auction from '../../Models/Auction.js';
import User from '../../Models/User.js';
import Bid from '../../Models/Bid.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';
import { createTestUser, createTestAuction } from '../helpers/testData.js';

describe('Auction Model', () => {
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
    let testUser;

    beforeEach(async () => {
      testUser = await User.create(createTestUser());
    });

    test('should create a valid auction with required fields', async () => {
      const auctionData = createTestAuction(testUser._id);
      const auction = await Auction.create(auctionData);

      expect(auction.title).toBe(auctionData.title);
      expect(auction.description).toBe(auctionData.description);
      expect(auction.category).toBe(auctionData.category);
      expect(auction.startingPrice).toBe(auctionData.startingPrice);
      expect(auction.currentPrice).toBe(auctionData.currentPrice);
      expect(auction.seller.toString()).toBe(testUser._id.toString());
    });

    test('should fail when required fields are missing', async () => {
      const invalidAuction = new Auction({
        description: 'Missing title'
      });

      await expect(invalidAuction.save()).rejects.toThrow();
    });

    test('should fail when title is too short', async () => {
      const auctionData = createTestAuction(testUser._id, { title: 'AB' });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Tytuł musi mieć co najmniej 3 znaki');
    });

    test('should fail when title is too long', async () => {
      const longTitle = 'A'.repeat(101);
      const auctionData = createTestAuction(testUser._id, { title: longTitle });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Tytuł nie może przekraczać 100 znaków');
    });

    test('should fail when description is too short', async () => {
      const auctionData = createTestAuction(testUser._id, { description: 'Short' });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Opis musi mieć co najmniej 10 znaków');
    });

    test('should fail with invalid category', async () => {
      const auctionData = createTestAuction(testUser._id, { category: 'InvalidCategory' });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Nieprawidłowa kategoria');
    });

    test('should fail when startingPrice is negative', async () => {
      const auctionData = createTestAuction(testUser._id, { startingPrice: -100 });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Cena wywoławcza nie może być ujemna');
    });

    test('should fail when endTime is before startTime', async () => {
      const now = new Date();
      const auctionData = createTestAuction(testUser._id, {
        startTime: now,
        endTime: new Date(now.getTime() - 1000)
      });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Data zakończenia musi być późniejsza niż data rozpoczęcia');
    });

    test('should accept valid condition values', async () => {
      const conditions = ['Nowy', 'Bardzo dobry', 'Dobry', 'Zadowalający', 'Do renowacji'];

      for (const condition of conditions) {
        const auctionData = createTestAuction(testUser._id, { condition });
        const auction = await Auction.create(auctionData);
        expect(auction.condition).toBe(condition);
      }
    });

    test('should reject invalid condition', async () => {
      const auctionData = createTestAuction(testUser._id, { condition: 'Invalid' });
      const auction = new Auction(auctionData);

      await expect(auction.save()).rejects.toThrow('Nieprawidłowy stan przedmiotu');
    });

    test('should validate image URLs', async () => {
      const invalidAuctionData = createTestAuction(testUser._id, {
        images: ['not-a-url']
      });
      const auction = new Auction(invalidAuctionData);

      await expect(auction.save()).rejects.toThrow('Nieprawidłowy URL obrazu');
    });

    test('should set currentPrice to startingPrice on creation', async () => {
      const auctionData = createTestAuction(testUser._id, { startingPrice: 500 });
      delete auctionData.currentPrice;

      const auction = await Auction.create(auctionData);
      expect(auction.currentPrice).toBe(500);
    });
  });

  describe('Instance Methods', () => {
    let testUser;
    let auction;

    beforeEach(async () => {
      testUser = await User.create(createTestUser());
      auction = await Auction.create(createTestAuction(testUser._id));
    });

    describe('incrementViews', () => {
      test('should increment views by 1', async () => {
        const initialViews = auction.views;
        await auction.incrementViews();

        expect(auction.views).toBe(initialViews + 1);
      });

      test('should persist views to database', async () => {
        await auction.incrementViews();
        const updatedAuction = await Auction.findById(auction._id);

        expect(updatedAuction.views).toBe(1);
      });
    });

    describe('addWatcher', () => {
      test('should add a watcher to the auction', async () => {
        const watcher = await User.create(createTestUser({
          username: 'watcher',
          email: 'watcher@example.com'
        }));

        await auction.addWatcher(watcher._id);

        expect(auction.watchers).toContainEqual(watcher._id);
        expect(auction.watchersCount).toBe(1);
      });

      test('should not add duplicate watchers', async () => {
        const watcher = await User.create(createTestUser({
          username: 'watcher',
          email: 'watcher@example.com'
        }));

        await auction.addWatcher(watcher._id);
        await auction.addWatcher(watcher._id);

        expect(auction.watchers.length).toBe(1);
      });
    });

    describe('removeWatcher', () => {
      test('should remove a watcher from the auction', async () => {
        const watcher = await User.create(createTestUser({
          username: 'watcher',
          email: 'watcher@example.com'
        }));

        await auction.addWatcher(watcher._id);
        await auction.removeWatcher(watcher._id);

        expect(auction.watchers).not.toContainEqual(watcher._id);
        expect(auction.watchersCount).toBe(0);
      });
    });

    describe('placeBid', () => {
      let bidder;

      beforeEach(async () => {
        bidder = await User.create(createTestUser({
          username: 'bidder',
          email: 'bidder@example.com'
        }));
      });

      test('should accept a valid bid', async () => {
        const bidAmount = auction.currentPrice + auction.bidIncrement;
        await auction.placeBid(bidder._id, bidAmount);

        expect(auction.currentPrice).toBe(bidAmount);
        expect(auction.winnerId.toString()).toBe(bidder._id.toString());
        expect(auction.totalBids).toBe(1);
      });

      test('should reject bid below minimum', async () => {
        const bidAmount = auction.currentPrice + 50; // Less than bidIncrement

        await expect(auction.placeBid(bidder._id, bidAmount))
          .rejects.toThrow(/Minimalna oferta to/);
      });

      test('should reject bid from seller', async () => {
        const bidAmount = auction.currentPrice + auction.bidIncrement;

        await expect(auction.placeBid(testUser._id, bidAmount))
          .rejects.toThrow('Nie możesz licytować własnej aukcji');
      });

      test('should reject bid on inactive auction', async () => {
        auction.status = 'completed';
        await auction.save();

        const bidAmount = auction.currentPrice + auction.bidIncrement;
        await expect(auction.placeBid(bidder._id, bidAmount))
          .rejects.toThrow('Aukcja nie jest aktywna');
      });

      test('should reject bid on expired auction', async () => {
        auction.endTime = new Date(Date.now() - 1000);
        await auction.save();

        const bidAmount = auction.currentPrice + auction.bidIncrement;
        await expect(auction.placeBid(bidder._id, bidAmount))
          .rejects.toThrow('Aukcja już się zakończyła');
      });
    });

    describe('complete', () => {
      test('should complete auction with winner', async () => {
        const bidder = await User.create(createTestUser({
          username: 'bidder',
          email: 'bidder@example.com'
        }));

        auction.winnerId = bidder._id;
        auction.currentPrice = 2000;
        await auction.complete();

        expect(auction.status).toBe('completed');
        expect(auction.winningBid).toBe(2000);
      });

      test('should complete auction without winner', async () => {
        await auction.complete();

        expect(auction.status).toBe('completed');
        expect(auction.winningBid).toBeNull();
      });

      test('should not complete already completed auction', async () => {
        auction.status = 'completed';
        await auction.save();

        await auction.complete();
        expect(auction.status).toBe('completed');
      });
    });

    describe('cancel', () => {
      test('should cancel an active auction', async () => {
        await auction.cancel('Test reason');

        expect(auction.status).toBe('cancelled');
      });

      test('should not cancel completed auction', async () => {
        auction.status = 'completed';
        await auction.save();

        await expect(auction.cancel('Test reason'))
          .rejects.toThrow('Nie można anulować zakończonej aukcji');
      });
    });

    describe('softDelete', () => {
      test('should mark auction as deleted', async () => {
        await auction.softDelete();

        expect(auction.isDeleted).toBe(true);
      });

      test('should persist soft delete to database', async () => {
        await auction.softDelete();
        const updatedAuction = await Auction.findById(auction._id);

        expect(updatedAuction.isDeleted).toBe(true);
      });
    });
  });

  describe('Virtual Fields', () => {
    let testUser;
    let auction;

    beforeEach(async () => {
      testUser = await User.create(createTestUser());
      auction = await Auction.create(createTestAuction(testUser._id, {
        endTime: new Date(Date.now() + 3600000) // 1 hour from now
      }));
    });

    test('timeRemaining should return correct value for active auction', () => {
      expect(auction.timeRemaining).toBeGreaterThan(0);
      expect(auction.timeRemaining).toBeLessThanOrEqual(3600000);
    });

    test('timeRemaining should return 0 for expired auction', async () => {
      auction.endTime = new Date(Date.now() - 1000);
      expect(auction.timeRemaining).toBe(0);
    });

    test('isActive should return true for active auction', () => {
      expect(auction.isActive).toBe(true);
    });

    test('isActive should return false for expired auction', async () => {
      auction.endTime = new Date(Date.now() - 1000);
      expect(auction.isActive).toBe(false);
    });

    test('reserveMet should return true when no reserve price', () => {
      expect(auction.reserveMet).toBe(true);
    });

    test('reserveMet should return false when below reserve', async () => {
      auction.reservePrice = 5000;
      auction.currentPrice = 1000;
      expect(auction.reserveMet).toBe(false);
    });

    test('reserveMet should return true when at or above reserve', async () => {
      auction.reservePrice = 1000;
      auction.currentPrice = 1500;
      expect(auction.reserveMet).toBe(true);
    });
  });

  describe('Static Methods', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create(createTestUser());
    });

    describe('findActive', () => {
      test('should find only active auctions', async () => {
        await Auction.create(createTestAuction(testUser._id, { status: 'active' }));
        await Auction.create(createTestAuction(testUser._id, { status: 'completed' }));
        await Auction.create(createTestAuction(testUser._id, { status: 'active' }));

        const activeAuctions = await Auction.findActive();
        expect(activeAuctions.length).toBe(2);
      });

      test('should filter by category', async () => {
        await Auction.create(createTestAuction(testUser._id, { category: 'Sztuka' }));
        await Auction.create(createTestAuction(testUser._id, { category: 'Antyki' }));

        const artAuctions = await Auction.findActive({ category: 'Sztuka' });
        expect(artAuctions.length).toBe(1);
        expect(artAuctions[0].category).toBe('Sztuka');
      });

      test('should filter by price range', async () => {
        await Auction.create(createTestAuction(testUser._id, { currentPrice: 500 }));
        await Auction.create(createTestAuction(testUser._id, { currentPrice: 1500 }));
        await Auction.create(createTestAuction(testUser._id, { currentPrice: 2500 }));

        const filteredAuctions = await Auction.findActive({
          minPrice: 1000,
          maxPrice: 2000
        });
        expect(filteredAuctions.length).toBe(1);
        expect(filteredAuctions[0].currentPrice).toBe(1500);
      });

      test('should paginate results', async () => {
        for (let i = 0; i < 5; i++) {
          await Auction.create(createTestAuction(testUser._id));
        }

        const page1 = await Auction.findActive({ page: 1, limit: 2 });
        const page2 = await Auction.findActive({ page: 2, limit: 2 });

        expect(page1.length).toBe(2);
        expect(page2.length).toBe(2);
        expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());
      });
    });

    describe('getFeatured', () => {
      test('should return only featured auctions', async () => {
        await Auction.create(createTestAuction(testUser._id, { featured: true }));
        await Auction.create(createTestAuction(testUser._id, { featured: false }));
        await Auction.create(createTestAuction(testUser._id, { featured: true }));

        const featured = await Auction.getFeatured();
        expect(featured.length).toBe(2);
        expect(featured.every(a => a.featured)).toBe(true);
      });

      test('should respect limit parameter', async () => {
        for (let i = 0; i < 5; i++) {
          await Auction.create(createTestAuction(testUser._id, { featured: true }));
        }

        const featured = await Auction.getFeatured(3);
        expect(featured.length).toBe(3);
      });
    });

    describe('closeExpiredAuctions', () => {
      test('should close expired auctions', async () => {
        const expiredAuction = await Auction.create(createTestAuction(testUser._id, {
          status: 'active',
          endTime: new Date(Date.now() - 1000)
        }));

        const count = await Auction.closeExpiredAuctions();

        expect(count).toBe(1);
        const updated = await Auction.findById(expiredAuction._id);
        expect(updated.status).toBe('completed');
      });

      test('should not close active auctions', async () => {
        await Auction.create(createTestAuction(testUser._id, {
          status: 'active',
          endTime: new Date(Date.now() + 3600000)
        }));

        const count = await Auction.closeExpiredAuctions();
        expect(count).toBe(0);
      });
    });
  });
});
