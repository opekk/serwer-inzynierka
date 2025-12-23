// Centralized error response handling utilities

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Error} error - Optional error object for debugging
 */
export const sendErrorResponse = (res, statusCode, message, error = null) => {
  const response = {
    success: false,
    message
  };

  // Include error details in development mode
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message;
  }

  console.error(`[ERROR ${statusCode}] ${message}`, error || '');

  return res.status(statusCode).json(response);
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Handle async controller errors with proper response
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Async error:', error);

    // Handle specific error types
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return sendErrorResponse(res, 400, messages[0], error);
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return sendErrorResponse(res, 400, `${field} już istnieje w bazie danych`, error);
    }

    if (error.name === 'CastError') {
      return sendErrorResponse(res, 400, 'Nieprawidłowe ID', error);
    }

    // Default server error
    return sendErrorResponse(res, 500, 'Błąd serwera', error);
  });
};
