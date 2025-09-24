/**
 * Response helper functions for consistent classroom API responses
 * Follows the specified JSON response format for educational clarity
 */

/**
 * Send list response with metadata
 * @param {Object} res - Express response object
 * @param {Array} items - Array of items to return
 * @param {Object} meta - Metadata object (pagination, filters, etc.)
 */
const listResponse = (res, items, meta = {}) => {
  res.status(200).json({
    meta,
    data: items
  });
};

/**
 * Send single item response
 * @param {Object} res - Express response object
 * @param {Object} item - Item to return
 * @param {number} status - HTTP status code (default: 200)
 */
const itemResponse = (res, item, status = 200) => {
  res.status(status).json({
    data: item
  });
};

/**
 * Send created response with Location header
 * @param {Object} res - Express response object
 * @param {Object} item - Created item
 * @param {string} location - Location header value (optional)
 */
const createdResponse = (res, item, location) => {
  if (location) {
    res.set('Location', location);
  }
  res.status(201).json({
    data: item
  });
};

/**
 * Send no content response
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  res.status(204).send();
};

module.exports = {
  listResponse,
  itemResponse,
  createdResponse,
  noContentResponse
};