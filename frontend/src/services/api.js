import { handleResponse, getAuthHeaders } from '../utils/apiHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credential, password) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential, password }),
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Auction API calls
export const auctionAPI = {
  // Pobierz wszystkie aukcje
  getAllAuctions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/auctions?${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Pobierz aukcję po ID
  getAuctionById: async (id) => {
    const response = await fetch(`${API_URL}/auctions/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Pobierz kategorie
  getCategories: async () => {
    const response = await fetch(`${API_URL}/auctions/categories`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Pobierz bidy dla aukcji
  getAuctionBids: async (id, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/auctions/${id}/bids?${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  // Utwórz aukcję (wymagana autoryzacja)
  createAuction: async (auctionData) => {
    const response = await fetch(`${API_URL}/auctions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(auctionData),
    });
    return handleResponse(response);
  },

  // Złóż ofertę (wymagana autoryzacja)
  placeBid: async (id, amount) => {
    const response = await fetch(`${API_URL}/auctions/${id}/bid`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },

  // Pobierz obserwowane aukcje (wymagana autoryzacja)
  getMyWatchlist: async () => {
    const response = await fetch(`${API_URL}/auctions/me/watchlist`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Bid API calls
export const bidAPI = {
  // Pobierz moje oferty (wymagana autoryzacja)
  getMyBids: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/bids/me?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Pobierz moje aktywne oferty (wymagana autoryzacja)
  getMyActiveBids: async () => {
    const response = await fetch(`${API_URL}/bids/me/active`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default authAPI;
