# Routes (`src/routes/`)

This folder contains API route definitions. Routes map HTTP methods and URLs to controller functions and apply middleware.

## Files

### `users.js` - User API Routes
This file defines all the endpoints for user management and maps them to controller functions.

## Route Definitions

The router is mounted at `/api/v1/users` in the main application, so the full URLs are:

### GET `/` → List Users
- **Full URL:** `GET /api/v1/users`
- **Controller:** `usersController.listUsers`
- **Middleware:** None
- **Purpose:** Get all users with optional filtering and pagination

```javascript
router.get('/', usersController.listUsers);
```

### GET `/:id` → Get Single User
- **Full URL:** `GET /api/v1/users/:id`
- **Controller:** `usersController.getUser`
- **Middleware:** None
- **Purpose:** Get a specific user by UUID

```javascript
router.get('/:id', usersController.getUser);
```

### POST `/` → Create User
- **Full URL:** `POST /api/v1/users`
- **Controller:** `usersController.createUser`
- **Middleware:** `validate(createSchema)` - validates request body
- **Purpose:** Create a new user

```javascript
router.post('/', validate(createSchema), usersController.createUser);
```

### PUT `/:id` → Update User
- **Full URL:** `PUT /api/v1/users/:id`
- **Controller:** `usersController.updateUser`
- **Middleware:** `validate(updateSchema)` - validates request body
- **Purpose:** Update an existing user

```javascript
router.put('/:id', validate(updateSchema), usersController.updateUser);
```

### DELETE `/:id` → Delete User
- **Full URL:** `DELETE /api/v1/users/:id`
- **Controller:** `usersController.deleteUser`
- **Middleware:** None
- **Purpose:** Delete a user

```javascript
router.delete('/:id', usersController.deleteUser);
```

## Route Structure

### Basic Route Pattern
```javascript
router.METHOD('path', [middleware1, middleware2], controllerFunction);
```

### With Validation Middleware
```javascript
router.post('/', validate(createSchema), usersController.createUser);
//           │    │                      │
//           │    │                      └── Controller function
//           │    └── Validation middleware
//           └── Route path
```

### URL Parameters
Routes can capture parts of the URL as parameters:

```javascript
router.get('/:id', usersController.getUser);
//         └── :id becomes req.params.id in the controller
```

## How This Connects to Other Parts

### Mounted in `app.js`
The user router is mounted in the main application:

```javascript
// In src/app.js
const usersRoutes = require('./routes/users');
app.use(`${config.BASE_PATH}/users`, usersRoutes);
//       │                           │
//       │                           └── Router from this file
//       └── /api/v1 (from config)
```

### Uses Controllers
Each route maps to a controller function:

```javascript
const usersController = require('../controllers/usersController');
router.get('/', usersController.listUsers);
```

### Uses Validation Middleware
Routes that accept request bodies use validation:

```javascript
const validate = require('../middlewares/validateRequest');
const { createSchema, updateSchema } = require('../validators/usersSchemas');

router.post('/', validate(createSchema), usersController.createUser);
```

## Middleware Order

Middleware runs in the order it's specified:

```javascript
router.post('/', 
  validate(createSchema),        // 1. Validate request body
  usersController.createUser     // 2. Handle the request
);
```

For the entire application, the order is:
1. **Global middleware** (CORS, JSON parsing) - in `app.js`
2. **Route middleware** (validation) - defined here
3. **Controller function** - handles the request
4. **Error handler** - catches any errors (if they occur)

## REST API Design

These routes follow REST conventions:

| HTTP Method | URL Pattern | Purpose | Controller |
|-------------|-------------|---------|------------|
| GET | `/users` | List all users | listUsers |
| GET | `/users/:id` | Get specific user | getUser |
| POST | `/users` | Create new user | createUser |
| PUT | `/users/:id` | Update user | updateUser |
| DELETE | `/users/:id` | Delete user | deleteUser |

## Route Parameters vs Query Parameters

### Route Parameters (`:id`)
Part of the URL path, required:
```
GET /api/v1/users/11111111-1111-4111-8111-111111111111
                 └── req.params.id
```

### Query Parameters (`?limit=10`)
Optional parameters after `?`:
```
GET /api/v1/users?limit=10&role=student
                  └── req.query.limit, req.query.role
```

## Adding New Routes

To add a new route:

1. **Define the route:**
```javascript
router.get('/search', usersController.searchUsers);
```

2. **Add validation if needed:**
```javascript
router.post('/bulk', validate(bulkCreateSchema), usersController.bulkCreate);
```

3. **Create the controller function:**
```javascript
// In usersController.js
const searchUsers = async (req, res, next) => {
  // Implementation
};
```

## Route Testing

Routes can be tested with supertest:

```javascript
const request = require('supertest');
const app = require('../app');

test('GET /api/v1/users returns users list', async () => {
  const response = await request(app)
    .get('/api/v1/users')
    .expect(200);
    
  expect(response.body.data).toBeInstanceOf(Array);
});
```

## Common Route Patterns

### Resource Routes (CRUD)
```javascript
router.get('/', list);           // GET /users
router.get('/:id', getOne);      // GET /users/123
router.post('/', create);        // POST /users
router.put('/:id', update);      // PUT /users/123
router.delete('/:id', remove);   // DELETE /users/123
```

### Nested Resources
```javascript
router.get('/:id/posts', getUserPosts);        // GET /users/123/posts
router.post('/:id/posts', createUserPost);     // POST /users/123/posts
```

### Action Routes
```javascript
router.post('/:id/activate', activateUser);    // POST /users/123/activate
router.post('/:id/reset-password', resetPassword); // POST /users/123/reset-password
```

## Error Handling in Routes

Routes don't handle errors directly - they rely on:

1. **Validation middleware** - catches invalid input
2. **Controller try-catch** - catches service errors
3. **Global error handler** - formats all errors consistently

If you need route-specific error handling:

```javascript
router.get('/:id', async (req, res, next) => {
  try {
    // Specific validation for this route
    if (!req.params.id.match(/^[0-9a-f-]{36}$/)) {
      const error = new Error('Invalid UUID format');
      error.statusCode = 400;
      throw error;
    }
    
    // Continue to controller
    return usersController.getUser(req, res, next);
  } catch (error) {
    next(error);
  }
});
```

## Related Documentation

- [`../controllers/README.md`](../controllers/README.md) - Controller functions called by routes
- [`../validators/README.md`](../validators/README.md) - Validation schemas used in routes
- [`../middlewares/README.md`](../middlewares/README.md) - Middleware functions
- [`../README.md`](../README.md) - How routes fit in the overall architecture