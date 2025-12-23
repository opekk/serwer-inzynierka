import express from 'express';
import auctionRoutes from '../../routes/auctionRoutes.js';
import bidRoutes from '../../routes/bidRoutes.js';

// Create Express app for testing
export const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/auctions', auctionRoutes);
  app.use('/api/bids', bidRoutes);

  return app;
};
