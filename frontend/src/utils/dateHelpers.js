// Date and time formatting utilities

/**
 * Format date to Polish locale string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format time remaining until end date
 * @param {string|Date} endTime - End date/time
 * @returns {string} Formatted time remaining (e.g., "2d 5h 30m" or "Zakończona")
 */
export const formatTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;

  if (diff <= 0) return 'Zakończona';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

/**
 * Check if auction/event is still active
 * @param {string|Date} endTime - End date/time
 * @returns {boolean} True if still active
 */
export const isActive = (endTime) => {
  return new Date(endTime) > new Date();
};

/**
 * Get year from date
 * @param {string|Date} date - Date to extract year from
 * @returns {number} Year
 */
export const getYear = (date) => {
  return new Date(date).getFullYear();
};
