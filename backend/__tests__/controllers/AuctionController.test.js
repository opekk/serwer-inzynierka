import request from 'supertest';
import mongoose from 'mongoose';
import Auction from '../../Models/Auction.js';
import User from '../../Models/User.js';
import Bid from '../../Models/Bid.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';
import { createTestAuction } from '../helpers/testData.js';
import { createAuthenticatedUser, createAuthenticatedAdmin } from '../helpers/authHelper.js';
import { createTestApp } from '../helpers/app.js';

describe('Auction Controller', () => {
  let app;

  beforeAll(async () => {
    await setupTestDB();
    app = createTestApp();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('GET /api/auctions - getAllAuctions', () => {
    test('should return all active auctions', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id));
      await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .get('/api/auctions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    test('should filter auctions by category', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id, { category: 'Sztuka' }));
      await Auction.create(createTestAuction(user._id, { category: 'Antyki' }));

      const response = await request(app)
        .get('/api/auctions?category=Sztuka')
        .expect(200);

      expect(response.body.results).toBe(1);
      expect(response.body.data[0].category).toBe('Sztuka');
    });

    test('should filter auctions by price range', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id, { currentPrice: 500 }));
      await Auction.create(createTestAuction(user._id, { currentPrice: 1500 }));
      await Auction.create(createTestAuction(user._id, { currentPrice: 2500 }));

      const response = await request(app)
        .get('/api/auctions?minPrice=1000&maxPrice=2000')
        .expect(200);

      expect(response.body.results).toBe(1);
      expect(response.body.data[0].currentPrice).toBe(1500);
    });

    test('should paginate results', async () => {
      const { user } = await createAuthenticatedUser();
      for (let i = 0; i < 5; i++) {
        await Auction.create(createTestAuction(user._id));
      }

      const response = await request(app)
        .get('/api/auctions?page=1&limit=2')
        .expect(200);

      expect(response.body.results).toBe(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(3);
    });

    test('should not return deleted auctions', async () => {
      const { user } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));
      await auction.softDelete();

      const response = await request(app)
        .get('/api/auctions')
        .expect(200);

      expect(response.body.results).toBe(0);
    });

    test('should sort auctions by specified field', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id, {
        currentPrice: 1000,
        endTime: new Date(Date.now() + 86400000)
      }));
      await Auction.create(createTestAuction(user._id, {
        currentPrice: 500,
        endTime: new Date(Date.now() + 172800000)
      }));

      const response = await request(app)
        .get('/api/auctions?sortBy=currentPrice&sortOrder=desc')
        .expect(200);

      expect(response.body.data[0].currentPrice).toBe(1000);
      expect(response.body.data[1].currentPrice).toBe(500);
    });
  });

  describe('GET /api/auctions/:id - getAuctionById', () => {
    test('should return auction by id', async () => {
      const { user } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .get(`/api/auctions/${auction._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(auction._id.toString());
      expect(response.body.data.title).toBe(auction.title);
    });

    test('should increment views when auction is viewed', async () => {
      const { user } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));

      await request(app).get(`/api/auctions/${auction._id}`);

      const updatedAuction = await Auction.findById(auction._id);
      expect(updatedAuction.views).toBe(1);
    });

    test('should return 404 for non-existent auction', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/auctions/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Nie znaleziono aukcji');
    });

    test('should return 404 for deleted auction', async () => {
      const { user } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));
      await auction.softDelete();

      const response = await request(app)
        .get(`/api/auctions/${auction._id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auctions/search - searchAuctions', () => {
    test('should search auctions by text', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id, {
        title: 'Vintage Clock',
        description: 'Beautiful antique clock from 1920s'
      }));
      await Auction.create(createTestAuction(user._id, {
        title: 'Modern Painting',
        description: 'Contemporary art piece'
      }));

      const response = await request(app)
        .get('/api/auctions/search?q=clock')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should return 400 when search query is missing', async () => {
      const response = await request(app)
        .get('/api/auctions/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Podaj frazę wyszukiwania (q)');
    });
  });

  describe('GET /api/auctions/featured - getFeaturedAuctions', () => {
    test('should return featured auctions', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id, { featured: true }));
      await Auction.create(createTestAuction(user._id, { featured: false }));
      await Auction.create(createTestAuction(user._id, { featured: true }));

      const response = await request(app)
        .get('/api/auctions/featured')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(2);
      expect(response.body.data.every(a => a.featured)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const { user } = await createAuthenticatedUser();
      for (let i = 0; i < 5; i++) {
        await Auction.create(createTestAuction(user._id, { featured: true }));
      }

      const response = await request(app)
        .get('/api/auctions/featured?limit=3')
        .expect(200);

      expect(response.body.results).toBe(3);
    });
  });

  describe('GET /api/auctions/categories - getCategories', () => {
    test('should return all categories with counts', async () => {
      const { user } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id, { category: 'Sztuka' }));
      await Auction.create(createTestAuction(user._id, { category: 'Sztuka' }));
      await Auction.create(createTestAuction(user._id, { category: 'Antyki' }));

      const response = await request(app)
        .get('/api/auctions/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      const artCategory = response.body.data.find(c => c.name === 'Sztuka');
      expect(artCategory.count).toBe(2);
    });
  });

  describe('POST /api/auctions - createAuction', () => {
    test('should fail without authentication', async () => {
      const auctionData = {
        title: 'New Auction Item',
        description: 'This is a test auction',
        category: 'Sztuka',
        startingPrice: 1000,
        bidIncrement: 100,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      const response = await request(app)
        .post('/api/auctions')
        .send(auctionData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail with invalid data', async () => {
      const { token } = await createAuthenticatedUser();

      const invalidData = {
        title: 'AB', // Too short
        description: 'Short',
        category: 'Invalid'
      };

      const response = await request(app)
        .post('/api/auctions')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail when endTime is before startTime', async () => {
      const { token } = await createAuthenticatedUser();

      const invalidData = {
        title: 'Test Auction',
        description: 'This is a test auction with invalid dates',
        category: 'Sztuka',
        startingPrice: 1000,
        bidIncrement: 100,
        startTime: new Date(),
        endTime: new Date(Date.now() - 1000)
      };

      const response = await request(app)
        .post('/api/auctions')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auctions/:id - updateAuction', () => {
    test('should not allow non-owner to update', async () => {
      const { user: owner } = await createAuthenticatedUser();
      const { token: otherToken } = await createAuthenticatedUser({
        username: 'otheruser',
        email: 'other@example.com'
      });

      const auction = await Auction.create(createTestAuction(owner._id));

      const response = await request(app)
        .put(`/api/auctions/${auction._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

  });

  describe('DELETE /api/auctions/:id - deleteAuction', () => {
    test('should soft delete auction as owner', async () => {
      const { user, token } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .delete(`/api/auctions/${auction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedAuction = await Auction.findById(auction._id);
      expect(deletedAuction.isDeleted).toBe(true);
    });

    test('should not allow non-owner to delete', async () => {
      const { user: owner } = await createAuthenticatedUser();
      const { token: otherToken } = await createAuthenticatedUser({
        username: 'otheruser',
        email: 'other@example.com'
      });

      const auction = await Auction.create(createTestAuction(owner._id));

      const response = await request(app)
        .delete(`/api/auctions/${auction._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should not allow deleting auction with bids', async () => {
      const { user, token } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));
      auction.totalBids = 1;
      await auction.save();

      const response = await request(app)
        .delete(`/api/auctions/${auction._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auctions/:id/bids - placeBid', () => {
    test('should fail when bid is too low', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { token } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));
      const lowBid = auction.currentPrice + 50; // Less than bidIncrement

      const response = await request(app)
        .post(`/api/auctions/${auction._id}/bid`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: lowBid })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should fail when seller tries to bid on own auction', async () => {
      const { user, token } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .post(`/api/auctions/${auction._id}/bid`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: auction.currentPrice + auction.bidIncrement })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auctions/:id/watchlist - addToWatchlist', () => {
    test('should add auction to watchlist', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { token } = await createAuthenticatedUser({
        username: 'watcher',
        email: 'watcher@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      const response = await request(app)
        .post(`/api/auctions/${auction._id}/watch`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.watchersCount).toBe(1);
    });
  });

  describe('DELETE /api/auctions/:id/watchlist - removeFromWatchlist', () => {
    test('should remove auction from watchlist', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: watcher, token } = await createAuthenticatedUser({
        username: 'watcher',
        email: 'watcher@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));
      await auction.addWatcher(watcher._id);

      const response = await request(app)
        .delete(`/api/auctions/${auction._id}/watch`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.watchersCount).toBe(0);
    });
  });

  describe('GET /api/auctions/my/auctions - getMyAuctions', () => {
    test('should return user auctions', async () => {
      const { user, token } = await createAuthenticatedUser();
      await Auction.create(createTestAuction(user._id));
      await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .get('/api/auctions/me/auctions')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(2);
    });
  });

  describe('GET /api/auctions/my/watchlist - getMyWatchlist', () => {
    test('should return watched auctions', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: watcher, token } = await createAuthenticatedUser({
        username: 'watcher',
        email: 'watcher@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));
      await auction.addWatcher(watcher._id);

      const response = await request(app)
        .get('/api/auctions/me/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(1);
    });
  });
});
