const API_URL = 'http://localhost:8080/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error('JSON parse error:', err);
    throw new Error('Invalid response from server');
  }

  if (!response.ok) {
    console.error('API Error:', { status: response.status, data });
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Admin API calls
export const adminAPI = {
  // Dashboard & Statistics
  getDashboardStats: async () => {
    const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getSystemHealth: async () => {
    const response = await fetch(`${API_URL}/admin/system/health`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  runSystemCleanup: async () => {
    const response = await fetch(`${API_URL}/admin/system/cleanup`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/users?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUserById: async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  toggleUserBan: async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/toggle-ban`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Auction Management
  getAllAuctions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/auctions?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  forceCloseAuction: async (id) => {
    const response = await fetch(`${API_URL}/admin/auctions/${id}/close`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  hardDeleteAuction: async (id) => {
    const response = await fetch(`${API_URL}/admin/auctions/${id}/hard-delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Bid Management
  getAllBids: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/admin/bids?${queryString}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  cancelBid: async (id, reason) => {
    const response = await fetch(`${API_URL}/admin/bids/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },
};

export default adminAPI;
