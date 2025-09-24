# Controllers (`src/controllers/`)

This folder contains request handlers that manage HTTP requests and responses. Controllers are the bridge between HTTP requests and your business logic.

## Files

### `usersController.js` - User Request Handlers
This file contains functions that handle HTTP requests for user management endpoints.

## Controller Functions

### `listUsers` - GET /api/v1/users
Handles requests to list users with optional query parameters.

**Query Parameters:**
- `limit` - Number of users to return (1-100, default: 10)
- `offset` - Number of users to skip (default: 0) 
- `role` - Filter by role: "student" or "instructor"
- `sort` - Sort order: "name:asc", "name:desc", "createdAt:asc", "createdAt:desc"

**Response Format:**
```javascript
{
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 3,
    "role": "student",    // only if filtering by role
    "sort": "name:asc"    // only if sorting
  },
  "data": [/* array of users */]
}
```

**Example Implementation:**
```javascript
const listUsers = async (req, res, next) => {
  try {
    // Parse and sanitize query parameters
    let { limit, offset, role, sort } = req.query;
    limit = limit ? parseInt(limit, 10) : 10;
    
    // Safety defaults & caps
    if (Number.isNaN(limit) || limit <= 0) limit = 10;
    const MAX_LIMIT = 100;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    
    const { items, total } = usersService.list(options);
    responseHelpers.listResponse(res, items, meta);
  } catch (error) {
    next(error);  // Forward to error handler
  }
};
```

### `getUser` - GET /api/v1/users/:id
Handles requests to get a single user by ID.

**Parameters:**
- `id` - User UUID from URL path

**Success Response (200):**
```javascript
{
  "data": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Asha",
    "email": "asha@example.com",
    "role": "student",
    "createdAt": "2025-09-24T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```javascript
{
  "error": {
    "message": "User with ID abc123 not found",
    "code": "USER_NOT_FOUND",
    "details": []
  }
}
```

### `createUser` - POST /api/v1/users
Handles requests to create a new user.

**Request Body:**
```javascript
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "role": "student"  // optional, defaults to "student"
}
```

**Success Response (201 Created):**
```javascript
{
  "data": {
    "id": "generated-uuid",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "role": "student",
    "createdAt": "2025-09-24T10:30:00.000Z"
  }
}
```

**Location Header:** `/api/v1/users/{new-user-id}`

### `updateUser` - PUT /api/v1/users/:id
Handles requests to update an existing user.

**Parameters:**
- `id` - User UUID from URL path

**Request Body (partial updates allowed):**
```javascript
{
  "name": "Asha Patel",
  "role": "instructor"
  // email field optional
}
```

**Success Response (200):**
```javascript
{
  "data": {
    "id": "11111111-1111-4111-8111-111111111111",
    "name": "Asha Patel",
    "email": "asha@example.com",
    "role": "instructor",
    "createdAt": "2025-09-24T00:00:00.000Z",
    "updatedAt": "2025-09-24T10:30:00.000Z"
  }
}
```

### `deleteUser` - DELETE /api/v1/users/:id
Handles requests to delete a user.

**Parameters:**
- `id` - User UUID from URL path

**Success Response:** `204 No Content` (empty body)

**Error Response (404):** User not found error

## Common Controller Patterns

### Try-Catch Error Handling
All controller functions use this pattern:

```javascript
const controllerFunction = async (req, res, next) => {
  try {
    // Extract data from request
    const { id } = req.params;
    const userData = req.body;
    
    // Call service function
    const result = usersService.someFunction(id, userData);
    
    // Send response using helper
    responseHelpers.itemResponse(res, result);
  } catch (error) {
    next(error);  // Forward to global error handler
  }
};
```

### Parameter Extraction
Controllers extract data from different parts of the request:

```javascript
const { id } = req.params;           // URL parameters: /users/:id
const { limit, role } = req.query;   // Query parameters: ?limit=10&role=student  
const userData = req.body;           // Request body (JSON)
```

### Response Helpers Usage
Controllers use response helpers for consistent formatting:

```javascript
responseHelpers.listResponse(res, items, meta);        // List with metadata
responseHelpers.itemResponse(res, user);               // Single item
responseHelpers.createdResponse(res, newUser, location); // Created resource
responseHelpers.noContentResponse(res);                // Successful deletion
```

### Custom Error Creation
Controllers create custom errors for specific cases:

```javascript
if (!user) {
  const error = new Error(`User with ID ${id} not found`);
  error.code = 'USER_NOT_FOUND';
  error.statusCode = 404;
  return next(error);
}
```

## How This Connects to Other Parts

### Called by Routes
Routes map HTTP methods and URLs to controller functions:

```javascript
// In routes/users.js
router.get('/', usersController.listUsers);
router.post('/', validate(createSchema), usersController.createUser);
```

### Calls Services
Controllers call service functions for business logic:

```javascript
const { items, total } = usersService.list(options);
const newUser = usersService.create(userData);
```

### Uses Response Helpers
Controllers format responses using utility functions:

```javascript
const responseHelpers = require('../utils/responseHelpers');
responseHelpers.itemResponse(res, user);
```

### Forwards Errors
Controllers forward errors to the global error handler:

```javascript
} catch (error) {
  next(error);  // Goes to errorHandler middleware
}
```

## Why This Layer Exists

Controllers provide several benefits:

- **HTTP Abstraction**: Handle HTTP-specific concerns (headers, status codes, parsing)
- **Request Validation**: Extract and validate data from requests
- **Response Formatting**: Ensure consistent response structure
- **Error Handling**: Catch and forward errors appropriately
- **Separation of Concerns**: Keep HTTP logic separate from business logic

## Input Validation Flow

1. **Route Middleware**: Validates request body against Joi schema
2. **Controller**: Receives cleaned, validated data in `req.body`
3. **Parameter Parsing**: Safely parse query parameters with defaults
4. **Service Call**: Pass validated data to business logic
5. **Response**: Format and send consistent response

## Testing Controllers

Controllers are easy to test by mocking the service layer:

```javascript
// Mock the service
const usersService = require('../services/usersService');
jest.mock('../services/usersService');

// Test the controller
test('listUsers returns formatted response', async () => {
  usersService.list.mockReturnValue({ items: [mockUser], total: 1 });
  
  await usersController.listUsers(mockReq, mockRes, mockNext);
  
  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith({
    meta: { limit: 10, offset: 0, total: 1 },
    data: [mockUser]
  });
});
```

## Related Documentation

- [`../services/README.md`](../services/README.md) - Business logic called by controllers
- [`../routes/README.md`](../routes/README.md) - How routes map to controllers
- [`../utils/README.md`](../utils/README.md) - Response helper functions
- [`../middlewares/README.md`](../middlewares/README.md) - Error handling middleware