# Utilities (`src/utils/`)

This folder contains helper functions and utilities used throughout the application. Utilities promote code reuse and consistency.

## Files

### `responseHelpers.js` - Response Formatting Functions
This file provides functions to format HTTP responses consistently across all endpoints.

## Response Helper Functions

All response helpers follow a consistent JSON structure for the classroom API.

### `listResponse(res, items, meta)` - List with Metadata
Used for endpoints that return multiple items with pagination or filtering information.

**Function Signature:**
```javascript
const listResponse = (res, items, meta = {}) => {
  res.status(200).json({
    meta,
    data: items
  });
};
```

**Usage:**
```javascript
// In controller
const { items, total } = usersService.list(options);
const meta = { limit: 10, offset: 0, total };
responseHelpers.listResponse(res, items, meta);
```

**Response Format:**
```javascript
{
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 3,
    "role": "student",    // Optional: if filtering applied
    "sort": "name:asc"    // Optional: if sorting applied
  },
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "Asha",
      "email": "asha@example.com",
      "role": "student",
      "createdAt": "2025-09-24T00:00:00.000Z"
    }
    // ... more users
  ]
}
```

### `itemResponse(res, item, status)` - Single Item
Used for endpoints that return a single resource.

**Function Signature:**
```javascript
const itemResponse = (res, item, status = 200) => {
  res.status(status).json({
    data: item
  });
};
```

**Usage:**
```javascript
// In controller
const user = usersService.getById(id);
responseHelpers.itemResponse(res, user);

// With custom status code
responseHelpers.itemResponse(res, user, 200);
```

**Response Format:**
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

### `createdResponse(res, item, location)` - Created Resource
Used for POST endpoints that create new resources. Returns 201 status and optionally sets Location header.

**Function Signature:**
```javascript
const createdResponse = (res, item, location) => {
  if (location) {
    res.set('Location', location);
  }
  res.status(201).json({
    data: item
  });
};
```

**Usage:**
```javascript
// In controller
const newUser = usersService.create(userData);
const location = `/api/v1/users/${newUser.id}`;
responseHelpers.createdResponse(res, newUser, location);
```

**Response:**
- **Status:** `201 Created`
- **Header:** `Location: /api/v1/users/new-user-id`
- **Body:**
```javascript
{
  "data": {
    "id": "new-uuid-generated",
    "name": "Alex Johnson",
    "email": "alex@example.com",
    "role": "student", 
    "createdAt": "2025-09-24T10:30:00.000Z"
  }
}
```

### `noContentResponse(res)` - Successful Deletion
Used for DELETE endpoints that successfully remove resources. Returns 204 status with no body.

**Function Signature:**
```javascript
const noContentResponse = (res) => {
  res.status(204).send();
};
```

**Usage:**
```javascript
// In controller
const deleted = usersService.remove(id);
if (deleted) {
  responseHelpers.noContentResponse(res);
}
```

**Response:**
- **Status:** `204 No Content`
- **Body:** Empty (no content)

## Response Format Standards

### Success Response Structure
All successful responses follow one of these patterns:

**Single Item:**
```javascript
{
  "data": { /* single object */ }
}
```

**Multiple Items:**
```javascript
{
  "meta": { /* pagination/filter info */ },
  "data": [ /* array of objects */ ]
}
```

**No Content:**
```
(Empty response body with 204 status)
```

### Status Codes Used
- **200 OK**: Successful GET, PUT operations
- **201 Created**: Successful POST operations  
- **204 No Content**: Successful DELETE operations

### Metadata in List Responses
The `meta` object contains information about the request and results:

```javascript
{
  "meta": {
    "limit": 10,        // Items per page
    "offset": 0,        // Items skipped
    "total": 25,        // Total matching items
    "role": "student",  // Applied filter (optional)
    "sort": "name:asc"  // Applied sorting (optional)
  }
}
```

## How This Connects to Other Parts

### Used by Controllers
Controllers call response helpers instead of formatting responses manually:

```javascript
// In usersController.js
const usersController = require('../controllers/usersController');
const responseHelpers = require('../utils/responseHelpers');

const listUsers = async (req, res, next) => {
  try {
    const { items, total } = usersService.list(options);
    const meta = { limit, offset, total };
    
    // Use helper instead of res.json() directly
    responseHelpers.listResponse(res, items, meta);
  } catch (error) {
    next(error);
  }
};
```

### Location Header for REST
The `createdResponse` function follows REST conventions by setting the Location header:

```javascript
// Points to the newly created resource
Location: /api/v1/users/11111111-1111-4111-8111-111111111111
```

This allows clients to immediately access the created resource.

## Benefits of Response Helpers

### Consistency
All endpoints return the same JSON structure:
- Easier for frontend developers to handle
- Predictable API behavior
- Consistent error vs success response patterns

### Maintainability  
Changes to response format only require updating the helper functions:
```javascript
// Add timestamp to all responses
const itemResponse = (res, item, status = 200) => {
  res.status(status).json({
    timestamp: new Date().toISOString(),  // Added to all responses
    data: item
  });
};
```

### Code Reuse
Controllers stay clean and focused on business logic:
```javascript
// Without helpers (repetitive)
res.status(200).json({ data: user });
res.status(201).json({ data: newUser });

// With helpers (clean)
responseHelpers.itemResponse(res, user);
responseHelpers.createdResponse(res, newUser, location);
```

## Testing Response Helpers

Response helpers can be tested independently:

```javascript
const responseHelpers = require('../utils/responseHelpers');

test('listResponse formats data correctly', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  
  const items = [{ id: 1, name: 'Test' }];
  const meta = { total: 1 };
  
  responseHelpers.listResponse(mockRes, items, meta);
  
  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith({
    meta: { total: 1 },
    data: [{ id: 1, name: 'Test' }]
  });
});
```

## Common Patterns

### Conditional Responses
```javascript
// In controller
if (user) {
  responseHelpers.itemResponse(res, user);
} else {
  const error = new Error('User not found');
  error.statusCode = 404;
  next(error);
}
```

### Custom Status Codes
```javascript
// Return different status for specific cases
if (isNewResource) {
  responseHelpers.createdResponse(res, resource, location);
} else {
  responseHelpers.itemResponse(res, resource, 200);  // Updated existing
}
```

### Empty Results
```javascript
// Empty list is still successful
const { items, total } = service.list(options);
responseHelpers.listResponse(res, items, { total, limit, offset });
// Returns: { meta: { total: 0 }, data: [] }
```

## Extending Response Helpers

To add a new response type:

```javascript
// Add to responseHelpers.js
const acceptedResponse = (res, resource) => {
  res.status(202).json({
    message: 'Request accepted for processing',
    data: resource
  });
};

// Use in controller
responseHelpers.acceptedResponse(res, processedRequest);
```

## Error vs Success Response Differences

**Success responses** (handled by response helpers):
```javascript
{
  "data": { /* actual content */ }
}
```

**Error responses** (handled by error middleware):
```javascript
{
  "error": {
    "message": "Something went wrong",
    "code": "ERROR_CODE",
    "details": []
  }
}
```

This clear distinction helps clients distinguish between successful data and error information.

## Why This Pattern Works

Response helpers provide:

- **Consistency**: All endpoints follow the same response structure
- **Maintainability**: Easy to change response format across entire API
- **Documentation**: Function names clearly indicate response type
- **Testing**: Each helper can be unit tested independently
- **REST Compliance**: Proper status codes and headers for different operations

## Related Documentation

- [`../controllers/README.md`](../controllers/README.md) - How controllers use response helpers
- [`../middlewares/README.md`](../middlewares/README.md) - Error response formatting
- [`../README.md`](../README.md) - Overall response flow in the application