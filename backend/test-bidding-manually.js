/**
 * Manual Test Script for Bidding Race Condition Fix
 *
 * Prerequisites:
 * 1. MongoDB must be running as a replica set (required for transactions)
 * 2. Update MONGODB_URI in .env to point to your replica set
 * 3. Have at least one test auction and two test users
 *
 * To run:
 * node test-bidding-manually.js <auctionId> <userId1> <userId2>
 *
 * This simulates two users bidding on the same auction simultaneously
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Auction from './Models/Auction.js';
import Bid from './Models/Bid.js';
import User from './Models/User.js';

dotenv.config();

// Simulate the placeBid controller logic
async function simulateBid(auctionId, bidderId, amount) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`\n[${bidderId}] Starting bid for ${amount} zł...`);

    let retries = 3;
    let bid = null;

    while (retries > 0) {
      try {
        const auction = await Auction.findById(auctionId).session(session);

        if (!auction || auction.isDeleted) {
          throw new Error('Nie znaleziono aukcji');
        }

        console.log(`[${bidderId}] Found auction v${auction.__v}, currentPrice: ${auction.currentPrice}`);

        // Validation
        if (auction.status !== 'active') {
          throw new Error('Aukcja nie jest aktywna');
        }

        if (auction.endTime <= Date.now()) {
          throw new Error('Aukcja już się zakończyła');
        }

        if (auction.seller.equals(bidderId)) {
          throw new Error('Nie możesz licytować własnej aukcji');
        }

        const minimumBid = auction.currentPrice + auction.bidIncrement;
        if (amount < minimumBid) {
          throw new Error(`Minimalna oferta to ${minimumBid} zł`);
        }

        // Create bid
        const bidArray = await Bid.create([{
          auction: auctionId,
          bidder: bidderId,
          amount,
          previousBid: auction.currentPrice,
          isWinning: true,
          status: 'active'
        }], { session });

        bid = bidArray[0];
        console.log(`[${bidderId}] Bid created: ${bid._id}`);

        // Atomic update with version check
        const updatedAuction = await Auction.findOneAndUpdate(
          {
            _id: auctionId,
            __v: auction.__v  // Optimistic locking
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
          console.log(`[${bidderId}] Version mismatch! Retrying...`);
          throw new Error('RETRY');
        }

        console.log(`[${bidderId}] Auction updated to v${updatedAuction.__v}, price: ${updatedAuction.currentPrice}`);

        // Mark previous bids as outbid
        const outbidResult = await Bid.updateMany(
          {
            auction: auctionId,
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

        console.log(`[${bidderId}] Marked ${outbidResult.modifiedCount} previous bids as outbid`);

        // Update user stats
        await User.findByIdAndUpdate(
          bidderId,
          { $inc: { 'stats.totalBidsPlaced': 1 } },
          { session }
        );

        await session.commitTransaction();
        console.log(`[${bidderId}] ✅ Transaction committed successfully!`);
        return { success: true, bid, finalPrice: updatedAuction.currentPrice };

      } catch (error) {
        if (error.message === 'RETRY' && retries > 1) {
          retries--;
          console.log(`[${bidderId}] ⚠️  Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
          continue;
        }
        throw error;
      }
    }

    throw new Error('Failed after all retries');

  } catch (error) {
    await session.abortTransaction();
    console.error(`[${bidderId}] ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    session.endSession();
  }
}

async function runTest() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get command line arguments
    const [auctionId, userId1, userId2] = process.argv.slice(2);

    if (!auctionId || !userId1 || !userId2) {
      console.error('Usage: node test-bidding-manually.js <auctionId> <userId1> <userId2>');
      process.exit(1);
    }

    // Fetch initial auction state
    const initialAuction = await Auction.findById(auctionId);
    if (!initialAuction) {
      console.error('Auction not found!');
      process.exit(1);
    }

    console.log('=== INITIAL STATE ===');
    console.log(`Auction: ${initialAuction.title}`);
    console.log(`Current Price: ${initialAuction.currentPrice} zł`);
    console.log(`Total Bids: ${initialAuction.totalBids}`);
    console.log(`Version: ${initialAuction.__v}`);
    console.log(`Bid Increment: ${initialAuction.bidIncrement} zł`);

    const minimumBid = initialAuction.currentPrice + initialAuction.bidIncrement;
    console.log(`\nMinimum next bid: ${minimumBid} zł`);

    // Simulate concurrent bids
    console.log('\n=== SIMULATING CONCURRENT BIDS ===');

    const bid1Amount = minimumBid;
    const bid2Amount = minimumBid + initialAuction.bidIncrement;

    console.log(`User 1 will bid: ${bid1Amount} zł`);
    console.log(`User 2 will bid: ${bid2Amount} zł`);

    const results = await Promise.all([
      simulateBid(auctionId, userId1, bid1Amount),
      simulateBid(auctionId, userId2, bid2Amount)
    ]);

    // Check final state
    console.log('\n=== FINAL STATE ===');
    const finalAuction = await Auction.findById(auctionId);
    console.log(`Current Price: ${finalAuction.currentPrice} zł`);
    console.log(`Total Bids: ${finalAuction.totalBids}`);
    console.log(`Version: ${finalAuction.__v}`);

    const allBids = await Bid.find({ auction: auctionId }).sort({ createdAt: -1 }).limit(5);
    console.log(`\nTotal bids in DB for this auction: ${await Bid.countDocuments({ auction: auctionId })}`);
    console.log(`Winning bids: ${allBids.filter(b => b.isWinning).length}`);

    console.log('\nRecent bids:');
    allBids.forEach((bid, i) => {
      console.log(`  ${i + 1}. ${bid.amount} zł - ${bid.isWinning ? '🏆 WINNING' : '❌ Outbid'} (${bid.status})`);
    });

    // Verify correctness
    console.log('\n=== VERIFICATION ===');
    const successfulBids = results.filter(r => r.success);
    console.log(`✓ Successful bids: ${successfulBids.length}/2`);
    console.log(`✓ totalBids matches DB count: ${finalAuction.totalBids === allBids.length ? 'YES' : 'NO'}`);
    console.log(`✓ Exactly one winning bid: ${allBids.filter(b => b.isWinning).length === 1 ? 'YES' : 'NO'}`);
    console.log(`✓ Current price matches winning bid: ${finalAuction.currentPrice === allBids.find(b => b.isWinning)?.amount ? 'YES' : 'NO'}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

runTest();
