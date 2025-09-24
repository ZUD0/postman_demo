# Source Code Overview (`src/`)

This folder contains all the source code for the Postman Demo API. The project follows a clean architecture pattern that separates concerns into different layers, making it easy to understand and maintain.

## Architecture Overview

The application follows this request flow:

1. **Client Request** → **Router** → **Validation Middleware** → **Controller** → **Service** → **Response**
2. If any error occurs, it goes to the **Error Handler** → **Response**

## Folder Structure

```
src/
├─ app.js                    # Express app setup and middleware configuration
├─ config/                   # Application configuration settings
│  └─ index.js
├─ routes/                   # API route definitions (URL mappings)
│  └─ users.js
├─ controllers/              # Request handlers (HTTP layer)
│  └─ usersController.js
├─ services/                 # Business logic and data management
│  └─ usersService.js
├─ validators/               # Input validation schemas
│  └─ usersSchemas.js
├─ middlewares/              # Reusable middleware functions
│  ├─ errorHandler.js
│  └─ validateRequest.js
└─ utils/                    # Helper functions and utilities
   └─ responseHelpers.js
```

## Key Files

### `app.js` - Express Application Setup
This is the main Express application file that:
- Sets up CORS and JSON parsing middleware
- Mounts the user routes at `/api/v1/users`
- Handles 404 errors for unknown routes
- Applies the global error handler

```javascript
// Mount user routes at the versioned base path
app.use(`${config.BASE_PATH}/users`, usersRoutes);
```

## How the Layers Work Together

### 1. Routes Layer (`routes/`)
- Maps HTTP methods and URLs to controller functions
- Applies validation middleware before calling controllers
- Example: `GET /api/v1/users` maps to `usersController.listUsers`

### 2. Controllers Layer (`controllers/`)
- Handle HTTP requests and responses
- Extract data from request (params, query, body)
- Call service functions to perform business logic
- Use response helpers to format consistent responses
- Forward errors to error handler using `next(error)`

### 3. Services Layer (`services/`)
- Contains business logic and data operations
- Manages the in-memory user data store
- Performs validations (like checking for duplicate emails)
- Throws custom errors with specific codes and status codes

### 4. Supporting Components

**Validators** (`validators/`):
- Define Joi schemas for input validation
- Specify required fields, data types, and constraints
- Generate user-friendly error messages

**Middlewares** (`middlewares/`):
- **validateRequest**: Validates request data against schemas
- **errorHandler**: Converts all errors into consistent JSON responses

**Utils** (`utils/`):
- **responseHelpers**: Format successful responses consistently
- Provides functions like `listResponse`, `itemResponse`, `createdResponse`

**Config** (`config/`):
- Stores application settings like port number and API base path
- Allows easy configuration changes without modifying code

## Data Flow Example

Here's what happens when you make a `POST /api/v1/users` request:

1. **Route** (`users.js`) receives the request
2. **Validation middleware** (`validateRequest.js`) checks the request body against the schema
3. **Controller** (`usersController.createUser`) extracts the validated data
4. **Service** (`usersService.create`) creates the user and adds it to memory
5. **Response helper** (`responseHelpers.createdResponse`) formats the success response
6. If any step fails, **Error handler** (`errorHandler.js`) formats the error response

## Why This Structure?

This architecture provides several benefits:

- **Separation of Concerns**: Each layer has a specific responsibility
- **Maintainability**: Easy to find and modify specific functionality
- **Testability**: Each component can be tested independently
- **Scalability**: Easy to add new features or swap components
- **Consistency**: Standardized error handling and response formatting

## Folder Documentation

For detailed information about each folder:

- [`config/README.md`](config/README.md) - Application configuration
- [`routes/README.md`](routes/README.md) - API route definitions
- [`controllers/README.md`](controllers/README.md) - Request handlers
- [`services/README.md`](services/README.md) - Business logic and data
- [`validators/README.md`](validators/README.md) - Input validation schemas
- [`middlewares/README.md`](middlewares/README.md) - Middleware functions
- [`utils/README.md`](utils/README.md) - Helper utilities

## Learning Path

If you're new to backend development, explore the folders in this order:

1. **config/** - See how basic settings work
2. **services/** - Understand the data and business logic
3. **controllers/** - Learn how HTTP requests are handled
4. **routes/** - See how URLs map to functions
5. **validators/** - Understand input validation
6. **middlewares/** - Learn about request processing
7. **utils/** - See how responses are formatted