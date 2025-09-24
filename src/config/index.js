/**
 * Application configuration settings
 */
module.exports = {
  // Server port - defaults to 3000 if not specified in environment
  PORT: process.env.PORT || 3000,
  
  // Base path for API routes - versioned for classroom exercises
  BASE_PATH: '/api/v1'
};