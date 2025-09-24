# Postman Demo API

A Node.js Express API demonstration project for testing with Postman. This project implements a simple user management system with full CRUD operations.

## Features

- User CRUD operations (Create, Read, Update, Delete)
- Request validation using Joi schemas
- Consistent error handling
- RESTful API design
- CORS support
- Structured project organization

## Project Structure

```
postman-demo/
├─ .gitignore
├─ package.json
├─ README.md
├─ postman_collection.json      # Postman collection for testing
├─ server.js                    # Application entry point
├─ src/
│ ├─ app.js                    # Express app configuration
│ ├─ config/
│ │ └─ index.js               # Application configuration
│ ├─ routes/
│ │ └─ users.js               # User routes
│ ├─ controllers/
│ │ └─ usersController.js     # User request handlers
│ ├─ services/
│ │ └─ usersService.js        # Business logic
│ ├─ validators/
│ │ └─ usersSchemas.js        # Joi validation schemas
│ ├─ middlewares/
│ │ ├─ errorHandler.js        # Global error handler
│ │ └─ validateRequest.js     # Request validation middleware
│ └─ utils/
│   └─ responseHelpers.js     # Response formatting helpers
```

## Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 by default (configurable via PORT environment variable).

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## User Schema

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

## Testing with Postman

Import the `postman_collection.json` file into Postman to get pre-configured requests for all endpoints.

## Environment Variables

- `PORT` - Server port (default: 3000)
- `BASE_PATH` - API base path (default: /api)

## License

MIT