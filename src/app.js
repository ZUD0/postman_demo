const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const usersRoutes = require('./routes/users');

/**
 * Create and configure Express application for classroom use
 * Simple, clean setup focused on learning REST API fundamentals
 */
const app = express();

// Middleware setup
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Mount user routes at the versioned base path
app.use(`${config.BASE_PATH}/users`, usersRoutes);

// Handle 404 for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND',
      details: []
    }
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;