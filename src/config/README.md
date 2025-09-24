# Configuration (`src/config/`)

This folder contains application configuration settings. Configuration allows you to change how the application behaves without modifying the source code.

## Files

### `index.js` - Application Configuration
This file exports configuration settings used throughout the application.

```javascript
module.exports = {
  // Server port - defaults to 3000 if not specified in environment
  PORT: process.env.PORT || 3000,
  
  // Base path for API routes - versioned for classroom exercises
  BASE_PATH: '/api/v1'
};
```

## Configuration Settings

- **`PORT`**: The port number where the server listens for requests
  - Default: `3000`
  - Can be changed by setting the `PORT` environment variable
  - Example: `set PORT=4000` then `npm start` (Windows)

- **`BASE_PATH`**: The base URL path for all API endpoints
  - Value: `/api/v1`
  - This means all endpoints start with `/api/v1`
  - Example: `/api/v1/users` instead of just `/users`

## How to Change Settings

### Change the Port
**Option 1 - Environment Variable (Recommended):**
```
set PORT=4000
npm start
```

**Option 2 - Edit the File:**
```javascript
PORT: 4000,  // Changed from process.env.PORT || 3000
```

### Change the Base Path
Edit the `BASE_PATH` value:
```javascript
BASE_PATH: '/api/v2'  // Changed from '/api/v1'
```

## How This Connects to Other Parts

### Used in `server.js`
```javascript
const config = require('./src/config');

app.listen(config.PORT, () => {
  console.log(`🚀 Server running at http://localhost:${config.PORT}${config.BASE_PATH}`);
});
```

### Used in `app.js`
```javascript
const config = require('./config');

// Mount user routes at the versioned base path
app.use(`${config.BASE_PATH}/users`, usersRoutes);
```

### Used in Controllers
Controllers use the base path to generate Location headers:
```javascript
const location = `${config.BASE_PATH}/users/${newUser.id}`;
```

## Why This Exists

Configuration files provide several benefits:

- **Environment Flexibility**: Different settings for development, testing, and production
- **Easy Deployment**: Change settings without modifying code
- **Centralized Settings**: All configuration in one place
- **Version Control**: Can exclude sensitive settings from version control

## Common Patterns

**Environment-based Configuration:**
```javascript
const config = {
  development: {
    PORT: 3000,
    BASE_PATH: '/api/v1'
  },
  production: {
    PORT: process.env.PORT || 80,
    BASE_PATH: '/api'
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

**Validation:**
```javascript
const PORT = process.env.PORT || 3000;

if (PORT < 1024 || PORT > 65535) {
  throw new Error('Invalid port number');
}
```

## Related Documentation

- [`../README.md`](../README.md) - Source code overview
- [`../routes/README.md`](../routes/README.md) - How routes use BASE_PATH