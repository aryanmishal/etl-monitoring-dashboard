// Utility functions for date formatting

/**
 * Converts YYYY-MM-DD format to DD-MM-YYYY format for display
 * @param {string} apiDate - Date in YYYY-MM-DD format
 * @returns {string} Date in DD-MM-YYYY format
 */
export const formatDateForDisplay = (apiDate) => {
  if (!apiDate) return '';
  
  const [year, month, day] = apiDate.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Converts DD-MM-YYYY format to YYYY-MM-DD format for API
 * @param {string} displayDate - Date in DD-MM-YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForAPI = (displayDate) => {
  if (!displayDate) return '';
  
  const [day, month, year] = displayDate.split('-');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 