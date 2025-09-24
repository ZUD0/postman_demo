const app = require('./src/app');
const config = require('./src/config');

/**
 * Server entry point - simple classroom-friendly startup
 */

// Start the server
app.listen(config.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${config.PORT}${config.BASE_PATH}`);
  console.log('Ready for Postman exercises!');
});