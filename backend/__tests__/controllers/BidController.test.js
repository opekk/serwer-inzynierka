import request from 'supertest';
import mongoose from 'mongoose';
import Auction from '../../Models/Auction.js';
import User from '../../Models/User.js';
import Bid from '../../Models/Bid.js';
import { setupTestDB, teardownTestDB, clearTestDB } from '../setup.js';
import { createTestAuction, createTestBid } from '../helpers/testData.js';
import { createAuthenticatedUser, createAuthenticatedAdmin } from '../helpers/authHelper.js';
import { createTestApp } from '../helpers/app.js';

describe('Bid Controller', () => {
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

  describe('GET /api/bids/auction/:auctionId/highest - getHighestBid', () => {
    test('should return the highest bid for an auction', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder1 } = await createAuthenticatedUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      });
      const { user: bidder2 } = await createAuthenticatedUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
      const highestBid = await Bid.create(createTestBid(auction._id, bidder2._id, 1500));

      const response = await request(app)
        .get(`/api/bids/auction/${auction._id}/highest`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.amount).toBe(1500);
      expect(response.body.data._id).toBe(highestBid._id.toString());
    });

    test('should return 404 when no bids exist', async () => {
      const { user } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .get(`/api/bids/auction/${auction._id}/highest`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Brak ofert dla tej aukcji');
    });
  });

  describe('GET /api/bids/auction/:auctionId/stats - getAuctionBidStats', () => {
    test('should return bid statistics for an auction', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder1 } = await createAuthenticatedUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      });
      const { user: bidder2 } = await createAuthenticatedUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
      await Bid.create(createTestBid(auction._id, bidder2._id, 1200));
      await Bid.create(createTestBid(auction._id, bidder1._id, 1300));

      const response = await request(app)
        .get(`/api/bids/auction/${auction._id}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBids).toBe(3);
      expect(response.body.data.uniqueBidders).toBe(2);
      expect(response.body.data.highestBid).toBe(1300);
      expect(response.body.data.lowestBid).toBe(1100);
      expect(response.body.data.averageBid).toBe(1200);
    });

    test('should return zero stats for auction with no bids', async () => {
      const { user } = await createAuthenticatedUser();
      const auction = await Auction.create(createTestAuction(user._id));

      const response = await request(app)
        .get(`/api/bids/auction/${auction._id}/stats`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBids).toBe(0);
      expect(response.body.data.uniqueBidders).toBe(0);
    });
  });

  describe('GET /api/bids/my - getMyBids', () => {
    test('should return authenticated user bids', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder, token } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction._id, bidder._id, 1100));
      await Bid.create(createTestBid(auction._id, bidder._id, 1200));

      const response = await request(app)
        .get('/api/bids/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(2);
    });

    test('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/bids/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should filter bids by status', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder, token } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction._id, bidder._id, 1100, { status: 'active' }));
      await Bid.create(createTestBid(auction._id, bidder._id, 1200, { status: 'won' }));

      const response = await request(app)
        .get('/api/bids/me?status=active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.results).toBe(1);
      expect(response.body.data[0].status).toBe('active');
    });

    test('should paginate results', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder, token } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      for (let i = 0; i < 5; i++) {
        await Bid.create(createTestBid(auction._id, bidder._id, 1100 + i * 100));
      }

      const response = await request(app)
        .get('/api/bids/me?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.results).toBe(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.totalPages).toBe(3);
    });
  });

  describe('GET /api/bids/my/active - getMyActiveBids', () => {
    test('should return only active winning bids', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder1, token } = await createAuthenticatedUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      });
      const { user: bidder2 } = await createAuthenticatedUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));

      // bidder1 places first bid (winning)
      await Bid.create(createTestBid(auction._id, bidder1._id, 1100));

      // bidder2 outbids bidder1
      await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

      const response = await request(app)
        .get('/api/bids/me/active')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(0); // bidder1 has no winning bids
    });

  });


  describe('GET /api/bids (Admin) - getAllBids', () => {
    test('should allow admin to view all bids', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder1 } = await createAuthenticatedUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      });
      const { user: bidder2 } = await createAuthenticatedUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      });
      const { token: adminToken } = await createAuthenticatedAdmin();

      const auction = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
      await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

      const response = await request(app)
        .get('/api/bids')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.results).toBe(2);
    });

    test('should not allow regular user to view all bids', async () => {
      const { token } = await createAuthenticatedUser();

      const response = await request(app)
        .get('/api/bids')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should filter by auction', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });
      const { token: adminToken } = await createAuthenticatedAdmin();

      const auction1 = await Auction.create(createTestAuction(seller._id));
      const auction2 = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction1._id, bidder._id, 1100));
      await Bid.create(createTestBid(auction2._id, bidder._id, 1200));

      const response = await request(app)
        .get(`/api/bids?auctionId=${auction1._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.results).toBe(1);
    });

    test('should filter by bidder', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder1 } = await createAuthenticatedUser({
        username: 'bidder1',
        email: 'bidder1@example.com'
      });
      const { user: bidder2 } = await createAuthenticatedUser({
        username: 'bidder2',
        email: 'bidder2@example.com'
      });
      const { token: adminToken } = await createAuthenticatedAdmin();

      const auction = await Auction.create(createTestAuction(seller._id));

      await Bid.create(createTestBid(auction._id, bidder1._id, 1100));
      await Bid.create(createTestBid(auction._id, bidder2._id, 1200));

      const response = await request(app)
        .get(`/api/bids?bidderId=${bidder1._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.results).toBe(1);
    });

    test('should paginate results', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });
      const { token: adminToken } = await createAuthenticatedAdmin();

      const auction = await Auction.create(createTestAuction(seller._id));

      for (let i = 0; i < 5; i++) {
        await Bid.create(createTestBid(auction._id, bidder._id, 1100 + i * 100));
      }

      const response = await request(app)
        .get('/api/bids?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.results).toBe(2);
      expect(response.body.currentPage).toBe(1);
    });
  });

  describe('GET /api/bids/:id (Admin) - getBidById', () => {
    test('should allow admin to view bid details', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });
      const { token: adminToken } = await createAuthenticatedAdmin();

      const auction = await Auction.create(createTestAuction(seller._id));
      const bid = await Bid.create(createTestBid(auction._id, bidder._id, 1100));

      const response = await request(app)
        .get(`/api/bids/${bid._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(bid._id.toString());
      expect(response.body.data.amount).toBe(1100);
    });

    test('should not allow regular user to view bid details', async () => {
      const { user: seller } = await createAuthenticatedUser();
      const { user: bidder } = await createAuthenticatedUser({
        username: 'bidder',
        email: 'bidder@example.com'
      });
      const { token: userToken } = await createAuthenticatedUser({
        username: 'otheruser',
        email: 'other@example.com'
      });

      const auction = await Auction.create(createTestAuction(seller._id));
      const bid = await Bid.create(createTestBid(auction._id, bidder._id, 1100));

      const response = await request(app)
        .get(`/api/bids/${bid._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent bid', async () => {
      const { token: adminToken } = await createAuthenticatedAdmin();
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/bids/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
