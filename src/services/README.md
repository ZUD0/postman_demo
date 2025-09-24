# Services (`src/services/`)

This folder contains business logic and data management. Services handle the core functionality of your application, separate from HTTP concerns.

## Files

### `usersService.js` - User Business Logic
This file manages user data and business rules. It provides functions for creating, reading, updating, and deleting users.

## In-Memory Data Store

The service starts with 3 seeded users for classroom exercises:

```javascript
let users = [
  { 
    id: '11111111-1111-4111-8111-111111111111', 
    name: 'Asha', 
    email: 'asha@example.com', 
    role: 'student', 
    createdAt: '2025-09-24T00:00:00.000Z' 
  },
  { 
    id: '22222222-2222-4222-8222-222222222222', 
    name: 'Ravi', 
    email: 'ravi@example.com', 
    role: 'student', 
    createdAt: '2025-09-24T00:00:00.000Z' 
  },
  { 
    id: '33333333-3333-4333-8333-333333333333', 
    name: 'Maya', 
    email: 'maya@example.com', 
    role: 'instructor', 
    createdAt: '2025-09-24T00:00:00.000Z' 
  }
];
```

## Service Functions

### `list(options)` - Get Users with Filtering
Returns a paginated list of users with optional filtering and sorting.

**Parameters:**
- `options.limit` - Maximum number of users to return (default: 10, max: 100)
- `options.offset` - Number of users to skip (default: 0)
- `options.role` - Filter by role: "student" or "instructor"
- `options.sort` - Sort by field: "name:asc", "name:desc", "createdAt:asc", "createdAt:desc"

**Returns:**
```javascript
{
  items: [array of user objects],
  total: number of matching users (before pagination)
}
```

**Example:**
```javascript
const result = usersService.list({ limit: 2, role: 'student' });
// Returns: { items: [Asha, Ravi], total: 2 }
```

### `getById(id)` - Get Single User
Finds a user by their UUID.

**Parameters:**
- `id` - User UUID string

**Returns:**
- User object if found, `null` if not found

**Example:**
```javascript
const user = usersService.getById('11111111-1111-4111-8111-111111111111');
// Returns: { id: '...', name: 'Asha', email: 'asha@example.com', ... }
```

### `create(payload)` - Create New User
Creates a new user with a generated UUID and timestamp.

**Parameters:**
- `payload.name` - User's name (required)
- `payload.email` - User's email (required, must be unique)
- `payload.role` - User's role (optional, defaults to "student")

**Returns:**
- The created user object with `id` and `createdAt` fields

**Business Rules:**
- Email addresses must be unique (case-insensitive)
- Throws error with code `VALIDATION_ERROR` if email exists

**Example:**
```javascript
const newUser = usersService.create({
  name: 'Alex Johnson',
  email: 'alex@example.com',
  role: 'student'
});
// Returns: { id: 'uuid...', name: 'Alex Johnson', ..., createdAt: '...' }
```

### `update(id, payload)` - Update User
Updates an existing user with new data.

**Parameters:**
- `id` - User UUID to update
- `payload` - Object with fields to update (partial updates allowed)

**Returns:**
- Updated user object if found, `null` if user doesn't exist

**Business Rules:**
- Email must be unique among other users (excluding current user)
- Adds `updatedAt` timestamp
- Throws error if email conflict

**Example:**
```javascript
const updated = usersService.update('11111111-1111-4111-8111-111111111111', {
  name: 'Asha Patel',
  role: 'instructor'
});
// Returns: { id: '...', name: 'Asha Patel', role: 'instructor', updatedAt: '...' }
```

### `remove(id)` - Delete User
Removes a user from the data store.

**Parameters:**
- `id` - User UUID to delete

**Returns:**
- `true` if user was deleted, `false` if user wasn't found

**Example:**
```javascript
const deleted = usersService.remove('11111111-1111-4111-8111-111111111111');
// Returns: true (if user existed)
```

## How This Connects to Other Parts

### Called by Controllers
Controllers call service functions and handle the results:

```javascript
// In usersController.js
const { items, total } = usersService.list(options);
responseHelpers.listResponse(res, items, { total, limit, offset });
```

### Error Handling
Services throw custom errors that controllers forward to the error handler:

```javascript
const error = new Error('Email already exists');
error.code = 'VALIDATION_ERROR';
error.statusCode = 400;
throw error;
```

### UUID Generation
Uses the `uuid` package to generate unique IDs:

```javascript
const { v4: uuidv4 } = require('uuid');
const newUser = { id: uuidv4(), ...userData };
```

## Why This Layer Exists

Services provide several benefits:

- **Business Logic Separation**: Core functionality separate from HTTP details
- **Data Consistency**: Centralized validation and business rules
- **Reusability**: Same logic can be used by different controllers or interfaces
- **Testing**: Business logic can be tested independently of HTTP layer
- **Future Database Migration**: Easy to replace in-memory storage with a real database

## Data Persistence Note

Currently, this service uses in-memory storage. Data is lost when the server restarts. This is perfect for classroom exercises because:

- No database setup required
- Predictable seed data for testing
- Easy to reset by restarting the server
- Students can focus on API concepts, not database complexity

## Migration to Real Database

When ready for production, you would:

1. Replace the `users` array with database queries
2. Make functions `async` and use `await`
3. Handle database connection errors
4. Keep the same function signatures so controllers don't change

Example with a database:
```javascript
const list = async (options = {}) => {
  const query = db.select('*').from('users');
  if (options.role) query.where('role', options.role);
  // ... rest of logic
  return { items: await query, total: await countQuery };
};
```

## Related Documentation

- [`../controllers/README.md`](../controllers/README.md) - How controllers use services
- [`../README.md`](../README.md) - Overall architecture overview