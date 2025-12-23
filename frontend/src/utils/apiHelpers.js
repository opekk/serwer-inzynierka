// Shared API utility functions

/**
 * Handle API response and parse JSON
 * @param {Response} response - Fetch API response object
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If response is not ok or JSON parsing fails
 */
export const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error('JSON parse error:', err);
    throw new Error('Nieprawidłowa odpowiedź z serwera');
  }

  if (!response.ok) {
    console.error('API Error:', { status: response.status, data });
    throw new Error(data.message || 'Coś poszło nie tak');
  }

  return data;
};

/**
 * Get authentication headers with JWT token
 * @returns {Object} Headers object with Content-Type and Authorization
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Get authentication headers without Content-Type (for file uploads)
 * @returns {Object} Headers object with only Authorization
 */
export const getAuthHeadersWithoutContentType = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
