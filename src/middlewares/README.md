# Middlewares (`src/middlewares/`)

This folder contains middleware functions that process HTTP requests. Middleware runs between receiving a request and sending a response.

## Files

### `validateRequest.js` - Request Validation Middleware
### `errorHandler.js` - Global Error Handler Middleware

## Request Flow Through Middleware

Here's how a request flows through the application:

```
1. Client Request
   ↓
2. Express Built-in Middleware (CORS, JSON parsing)
   ↓
3. Route-specific Middleware (validateRequest)
   ↓
4. Controller Function
   ↓
5. Response Helper
   ↓
6. Client Response

   (If error occurs at any step)
   ↓
7. Error Handler Middleware
   ↓
8. Error Response to Client
```

## validateRequest.js - Input Validation

This middleware validates request bodies against Joi schemas before they reach controllers.

### How It Works

```javascript
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // Get all validation errors
      stripUnknown: true    // Remove unknown fields
    });

    if (error) {
      error.isJoi = true;   // Mark for error handler
      return next(error);   // Forward to error handler
    }

    req.body = value;       // Replace with cleaned data
    next();                 // Continue to controller
  };
};
```

### Usage in Routes

```javascript
const validate = require('../middlewares/validateRequest');
const { createSchema } = require('../validators/usersSchemas');

router.post('/', validate(createSchema), usersController.createUser);
//              └── Validation runs before controller
```

### What It Does

1. **Validates Data**: Checks request body against the provided Joi schema
2. **Collects All Errors**: Returns all validation errors, not just the first one
3. **Cleans Data**: Removes unknown fields and applies defaults
4. **Forwards Errors**: Sends validation errors to the error handler
5. **Replaces req.body**: Controller receives clean, validated data

### Example Process

**Valid Request:**
```javascript
// Request body:
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "role": "student",
  "extra": "ignored"     // This field will be stripped
}

// After validation (req.body):
{
  "name": "Alex Johnson",
  "email": "alex@example.com", 
  "role": "student"
}
// Controller receives clean data, "extra" field removed
```

**Invalid Request:**
```javascript
// Request body:
{
  "name": "A",                    // Too short
  "email": "not-an-email"         // Invalid format
}

// Validation error sent to error handler:
{
  "isJoi": true,
  "details": [
    { "path": ["name"], "message": "Name must be at least 2 characters long" },
    { "path": ["email"], "message": "Please provide a valid email address" }
  ]
}
```

## errorHandler.js - Global Error Processing

This middleware catches all errors and formats them into consistent JSON responses.

### Error Response Format

All errors return this structure:
```javascript
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE_CONSTANT", 
    "details": []  // Array of additional error information
  }
}
```

### Error Types Handled

#### 1. Joi Validation Errors (400)
```javascript
// Input error:
error.isJoi = true;
error.details = [{ path: ['email'], message: 'Invalid email' }];

// Output response:
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      }
    ]
  }
}
```

#### 2. Business Logic Errors (400)
```javascript
// Service throws:
const error = new Error('Email already exists');
error.code = 'VALIDATION_ERROR';
error.statusCode = 400;

// Output response:
{
  "error": {
    "message": "Email already exists", 
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

#### 3. Not Found Errors (404)
```javascript
// Controller throws:
const error = new Error('User with ID abc123 not found');
error.code = 'USER_NOT_FOUND';
error.statusCode = 404;

// Output response:
{
  "error": {
    "message": "User with ID abc123 not found",
    "code": "USER_NOT_FOUND", 
    "details": []
  }
}
```

#### 4. Server Errors (500)
```javascript
// Any unexpected error:
throw new Error('Database connection failed');

// Output response:
{
  "error": {
    "message": "Internal Server Error",  // Generic message for security
    "code": "INTERNAL_ERROR",
    "details": []
  }
}
```

### Error Handler Implementation

```javascript
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', err.message);
  console.error('Stack:', err.stack);

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal Server Error';
  let details = [];

  // Handle different error types
  if (err.isJoi) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  } else if (err.code === 'USER_NOT_FOUND') {
    statusCode = 404;
    code = 'USER_NOT_FOUND';
    message = err.message;
  }
  // ... handle other error types

  res.status(statusCode).json({
    error: { message, code, details }
  });
};
```

## Error Codes Used in the Application

| Error Code | Status | Description | Example |
|------------|--------|-------------|---------|
| `VALIDATION_ERROR` | 400 | Invalid input data | Missing required field, invalid email |
| `USER_NOT_FOUND` | 404 | User doesn't exist | GET /users/invalid-id |
| `ROUTE_NOT_FOUND` | 404 | Invalid endpoint | GET /api/v1/invalid |
| `INTERNAL_ERROR` | 500 | Server error | Database crash, unexpected exception |

## How Errors Are Created

### In Controllers
```javascript
if (!user) {
  const error = new Error(`User with ID ${id} not found`);
  error.code = 'USER_NOT_FOUND';
  error.statusCode = 404;
  return next(error);  // Forward to error handler
}
```

### In Services
```javascript
if (existingUser) {
  const error = new Error('Email already exists');
  error.code = 'VALIDATION_ERROR';
  error.statusCode = 400;
  throw error;  // Controller catches and forwards to error handler
}
```

### In Routes (Validation)
```javascript
// Validation middleware automatically creates and forwards errors
const { error } = schema.validate(req.body);
if (error) {
  error.isJoi = true;
  return next(error);
}
```

## Middleware Execution Order

### Successful Request
```
1. CORS middleware → 2. JSON parser → 3. Route matcher → 4. Validation → 5. Controller → 6. Response
```

### Request with Error
```
1. CORS middleware → 2. JSON parser → 3. Route matcher → 4. Validation (ERROR) → 5. Error Handler → 6. Error Response
```

### Unexpected Error
```
1-5. Normal flow → 6. Controller (ERROR) → 7. Error Handler → 8. Error Response
```

## Best Practices for Error Handling

### 1. Use Consistent Error Codes
```javascript
// Good: Consistent naming
error.code = 'USER_NOT_FOUND';
error.code = 'VALIDATION_ERROR';

// Bad: Inconsistent naming  
error.code = 'UserNotFound';
error.code = 'validationFailed';
```

### 2. Provide Helpful Messages
```javascript
// Good: Specific and actionable
error.message = 'User with ID abc123 not found';

// Bad: Vague and unhelpful
error.message = 'Not found';
```

### 3. Set Appropriate Status Codes
```javascript
// Client errors (4xx)
error.statusCode = 400;  // Bad request
error.statusCode = 404;  // Not found
error.statusCode = 409;  // Conflict

// Server errors (5xx)
error.statusCode = 500;  // Internal server error
```

### 4. Don't Leak Sensitive Information
```javascript
// Good: Generic message for server errors
res.status(500).json({
  error: {
    message: 'Internal Server Error',  // Don't expose details
    code: 'INTERNAL_ERROR'
  }
});

// Bad: Exposes system details
res.status(500).json({
  error: {
    message: err.stack,  // Security risk!
    code: 'INTERNAL_ERROR'
  }
});
```

## Testing Error Handling

### Test Validation Errors
```javascript
test('POST /users returns validation error for invalid data', async () => {
  const response = await request(app)
    .post('/api/v1/users')
    .send({ name: 'A' })  // Too short
    .expect(400);
    
  expect(response.body.error.code).toBe('VALIDATION_ERROR');
  expect(response.body.error.details).toHaveLength(1);
});
```

### Test Not Found Errors
```javascript
test('GET /users/:id returns 404 for non-existent user', async () => {
  const response = await request(app)
    .get('/api/v1/users/invalid-id')
    .expect(404);
    
  expect(response.body.error.code).toBe('USER_NOT_FOUND');
});
```

## Why This Pattern Works

The middleware approach provides:

- **Centralized Error Handling**: All errors formatted consistently
- **Separation of Concerns**: Validation separate from business logic
- **Clean Controllers**: Controllers focus on business logic, not error formatting
- **Consistent API**: All endpoints return the same error structure
- **Easy Testing**: Middleware can be tested independently

## Related Documentation

- [`../validators/README.md`](../validators/README.md) - Joi schemas used by validation middleware
- [`../controllers/README.md`](../controllers/README.md) - How controllers create and forward errors
- [`../utils/README.md`](../utils/README.md) - Response helpers for successful responses
- [`../README.md`](../README.md) - Overall request flow architecture