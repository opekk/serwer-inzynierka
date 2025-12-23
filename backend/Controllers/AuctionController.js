import Auction from '../Models/Auction.js';
import Bid from '../Models/Bid.js';
import User from '../Models/User.js';

// ============================================
// PUBLIC ENDPOINTS (No authentication required)
// ============================================

// Pobierz wszystkie aktywne aukcje
export const getAllAuctions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      sortBy = 'endTime',
      sortOrder = 'asc',
      status = 'active'
    } = req.query;

    const query = {
      isDeleted: false
    };

    // Filtrowanie po statusie
    if (status) query.status = status;

    // Filtrowanie po kategorii
    if (category) query.category = category;

    // Filtrowanie po cenie
    if (minPrice || maxPrice) {
      query.currentPrice = {};
      if (minPrice) query.currentPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.currentPrice.$lte = parseFloat(maxPrice);
    }

    // Dla aktywnych aukcji - tylko te które się jeszcze nie zakończyły
    if (status === 'active') {
      query.endTime = { $gt: Date.now() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auctions = await Auction.find(query)
      .populate('seller', 'username rating avatar')
      .populate('winnerId', 'username')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Auction.countDocuments(query);

    res.status(200).json({
      success: true,
      results: auctions.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania aukcji',
      error: error.message
    });
  }
};

// Pobierz pojedynczą aukcję po ID
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'username rating avatar email phone')
      .populate('winnerId', 'username rating avatar');

    if (!auction || auction.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono aukcji'
      });
    }

    // Zwiększ licznik wyświetleń
    auction.incrementViews();

    res.status(200).json({
      success: true,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania aukcji',
      error: error.message
    });
  }
};

// Wyszukaj aukcje
export const searchAuctions = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      status = 'active',
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Podaj frazę wyszukiwania (q)'
      });
    }

    const result = await Auction.searchAuctions(q, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      status,
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas wyszukiwania aukcji',
      error: error.message
    });
  }
};

// Pobierz polecane aukcje
export const getFeaturedAuctions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const auctions = await Auction.getFeatured(limit);

    res.status(200).json({
      success: true,
      results: auctions.length,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania polecanych aukcji',
      error: error.message
    });
  }
};

// Pobierz kategorie aukcji
export const getCategories = async (req, res) => {
  try {
    const categories = [
      'Sztuka',
      'Antyki',
      'Biżuteria',
      'Monety i Banknoty',
      'Książki',
      'Militaria',
      'Meble',
      'Porcelana i Ceramika',
      'Zegarki',
      'Instrumenty Muzyczne',
      'Elektronika',
      'Inne'
    ];

    // Pobierz liczność dla każdej kategorii
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Auction.countDocuments({
          category,
          status: 'active',
          isDeleted: false,
          endTime: { $gt: Date.now() }
        });
        return { name: category, count };
      })
    );

    res.status(200).json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania kategorii',
      error: error.message
    });
  }
};

// Pobierz bidy dla aukcji
export const getAuctionBids = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const bids = await Bid.getAuctionBids(req.params.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    const total = await Bid.countDocuments({ auction: req.params.id });

    res.status(200).json({
      success: true,
      results: bids.length,
      total,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania historii licytacji',
      error: error.message
    });
  }
};

// ============================================
// PROTECTED ENDPOINTS (Authentication required)
// ============================================

// Utwórz nową aukcję
export const createAuction = async (req, res) => {
  try {
    const auctionData = {
      ...req.body,
      seller: req.user._id
    };

    // Walidacja dat
    const startTime = new Date(auctionData.startTime || Date.now());
    const endTime = new Date(auctionData.endTime);

    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'Data zakończenia musi być późniejsza niż data rozpoczęcia'
      });
    }

    const auction = await Auction.create(auctionData);

    // Aktualizacja statystyk użytkownika
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalAuctionsCreated': 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Aukcja została utworzona pomyślnie',
      data: auction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Błąd podczas tworzenia aukcji',
      error: error.message
    });
  }
};

// Aktualizuj aukcję (tylko właściciel)
export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction || auction.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono aukcji'
      });
    }

    // Sprawdź czy użytkownik jest właścicielem
    if (!auction.seller.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nie masz uprawnień do edycji tej aukcji'
      });
    }

    // Nie pozwól na edycję jeśli aukcja jest aktywna i ma oferty
    if (auction.status === 'active' && auction.totalBids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Nie można edytować aukcji z aktywnymi ofertami'
      });
    }

    // Pola które można edytować
    const allowedFields = [
      'title',
      'description',
      'category',
      'images',
      'model3D',
      'condition',
      'technicalDetails',
      'auctionHouse'
    ];

    // Jeśli aukcja jest w drafcie, pozwól na więcej zmian
    if (auction.status === 'draft') {
      allowedFields.push(
        'startingPrice',
        'bidIncrement',
        'reservePrice',
        'buyNowPrice',
        'startTime',
        'endTime'
      );
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Aukcja zaktualizowana pomyślnie',
      data: updatedAuction
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji aukcji',
      error: error.message
    });
  }
};

// Usuń aukcję (soft delete, tylko właściciel)
export const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction || auction.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono aukcji'
      });
    }

    // Sprawdź czy użytkownik jest właścicielem
    if (!auction.seller.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Nie masz uprawnień do usunięcia tej aukcji'
      });
    }

    // Nie pozwól na usunięcie jeśli aukcja jest aktywna i ma oferty
    if (auction.status === 'active' && auction.totalBids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Nie można usunąć aukcji z aktywnymi ofertami'
      });
    }

    await auction.softDelete();

    res.status(200).json({
      success: true,
      message: 'Aukcja usunięta pomyślnie'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania aukcji',
      error: error.message
    });
  }
};

// Złóż ofertę - Fixed version with optimistic locking and transactions
export const placeBid = async (req, res) => {
  const mongoose = (await import('mongoose')).default;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('=== PLACE BID REQUEST ===');
    console.log('Body:', req.body);
    console.log('Auction ID:', req.params.id);
    console.log('User ID:', req.user._id);

    const { amount } = req.body;
    const auctionId = req.params.id;
    const bidderId = req.user._id;

    // Basic input validation
    if (!amount || amount <= 0) {
      await session.abortTransaction();
      console.log('ERROR: Invalid amount');
      return res.status(400).json({
        success: false,
        message: 'Podaj prawidłową kwotę oferty'
      });
    }

    // Retry logic for handling concurrent bids (optimistic locking)
    let retries = 3;
    let bid = null;
    let finalAuction = null;

    while (retries > 0) {
      try {
        // Fetch auction with current version within transaction
        const auction = await Auction.findById(auctionId).session(session);

        if (!auction || auction.isDeleted) {
          throw new Error('Nie znaleziono aukcji');
        }

        console.log('Auction found:', {
          title: auction.title,
          currentPrice: auction.currentPrice,
          version: auction.__v
        });

        // Validate BEFORE modifying anything
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

        console.log('Validation passed, creating bid...');

        // Create bid document first
        const bidArray = await Bid.create([{
          auction: auctionId,
          bidder: bidderId,
          amount,
          previousBid: auction.currentPrice,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          isWinning: true,
          status: 'active'
        }], { session });

        bid = bidArray[0];
        console.log('Bid created:', bid._id);

        // Update auction atomically with version check
        const updatedAuction = await Auction.findOneAndUpdate(
          {
            _id: auctionId,
            __v: auction.__v  // Only update if version matches (optimistic locking)
          },
          {
            $set: {
              currentPrice: amount,
              winnerId: bidderId
            },
            $inc: {
              totalBids: 1,
              __v: 1  // Increment version
            }
          },
          {
            new: true,
            session,
            runValidators: true
          }
        );

        if (!updatedAuction) {
          // Version mismatch - another bid won the race
          console.log('Version mismatch, retrying...');
          throw new Error('RETRY');
        }

        finalAuction = updatedAuction;
        console.log('Auction updated:', {
          currentPrice: updatedAuction.currentPrice,
          totalBids: updatedAuction.totalBids,
          version: updatedAuction.__v
        });

        // Mark previous bids as outbid
        await Bid.updateMany(
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

        console.log('Previous bids marked as outbid');

        // Update user stats
        await User.findByIdAndUpdate(
          bidderId,
          { $inc: { 'stats.totalBidsPlaced': 1 } },
          { session }
        );

        console.log('User stats updated');

        // Commit transaction
        await session.commitTransaction();
        console.log('Transaction committed successfully');
        break;  // Success! Exit retry loop

      } catch (error) {
        if (error.message === 'RETRY' && retries > 1) {
          retries--;
          console.log(`Retrying... (${retries} attempts remaining)`);
          // Brief delay before retry to reduce contention
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
          continue;
        }
        // Not a retry error or out of retries
        throw error;
      }
    }

    if (!bid) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: 'Nie udało się złożyć oferty - zbyt duża konkurencja. Spróbuj ponownie.'
      });
    }

    // Populate bid for response
    const populatedBid = await Bid.findById(bid._id)
      .populate('bidder', 'username rating avatar')
      .populate('auction', 'title currentPrice endTime');

    console.log('SUCCESS: Bid placed successfully');

    res.status(201).json({
      success: true,
      message: 'Oferta została złożona pomyślnie',
      data: populatedBid
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('ERROR: Exception in placeBid:', error);

    const statusCode = error.message.includes('Minimalna oferta') ||
                      error.message.includes('nie jest aktywna') ||
                      error.message.includes('zakończyła') ||
                      error.message.includes('własnej aukcji') ? 400 : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Błąd podczas składania oferty'
    });
  } finally {
    session.endSession();
  }
};

// Dodaj do obserwowanych
export const addToWatchlist = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction || auction.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono aukcji'
      });
    }

    await auction.addWatcher(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Aukcja dodana do obserwowanych',
      data: { watchersCount: auction.watchersCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas dodawania do obserwowanych',
      error: error.message
    });
  }
};

// Usuń z obserwowanych
export const removeFromWatchlist = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction || auction.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono aukcji'
      });
    }

    await auction.removeWatcher(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Aukcja usunięta z obserwowanych',
      data: { watchersCount: auction.watchersCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania z obserwowanych',
      error: error.message
    });
  }
};

// Pobierz obserwowane aukcje użytkownika
export const getMyWatchlist = async (req, res) => {
  try {
    const auctions = await Auction.find({
      watchers: req.user._id,
      isDeleted: false
    })
      .populate('seller', 'username rating avatar')
      .sort({ endTime: 1 });

    res.status(200).json({
      success: true,
      results: auctions.length,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania obserwowanych aukcji',
      error: error.message
    });
  }
};

// Pobierz aukcje użytkownika
export const getMyAuctions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const query = {
      seller: req.user._id,
      isDeleted: false
    };

    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const auctions = await Auction.find(query)
      .populate('winnerId', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Auction.countDocuments(query);

    res.status(200).json({
      success: true,
      results: auctions.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      data: auctions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania aukcji użytkownika',
      error: error.message
    });
  }
};

// Pobierz aktywne oferty użytkownika
export const getMyBids = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status
    } = req.query;

    const bids = await Bid.getUserBids(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    const total = await Bid.countDocuments({ bidder: req.user._id });

    res.status(200).json({
      success: true,
      results: bids.length,
      total,
      data: bids
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania ofert użytkownika',
      error: error.message
    });
  }
};

// ============================================
// ADMIN ENDPOINTS (Admin role required)
// ============================================

// Zamknij wygasłe aukcje (cron job)
export const closeExpiredAuctions = async (req, res) => {
  try {
    const closedCount = await Auction.closeExpiredAuctions();

    res.status(200).json({
      success: true,
      message: `Zamknięto ${closedCount} aukcji`,
      data: { closedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas zamykania aukcji',
      error: error.message
    });
  }
};

// Ustaw aukcję jako polecaną
export const setFeatured = async (req, res) => {
  try {
    const { featured } = req.body;

    const auction = await Auction.findByIdAndUpdate(
      req.params.id,
      { featured: featured === true },
      { new: true }
    );

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: 'Nie znaleziono aukcji'
      });
    }

    res.status(200).json({
      success: true,
      message: `Aukcja ${featured ? 'dodana do' : 'usunięta z'} polecanych`,
      data: auction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji aukcji',
      error: error.message
    });
  }
};
