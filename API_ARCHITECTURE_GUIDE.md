# Postman Demo API - Complete Architecture Guide
*For Final Year Masters Students*

---

## 📊 API Endpoints Overview

### **Base URL:** `http://localhost:3000/api/v1`

| Method | Endpoint | Purpose | Body Required | Query Parameters |
|--------|----------|---------|---------------|------------------|
| `GET` | `/users` | List all users (with filtering/pagination) | No | `limit`, `offset`, `role`, `sort` |
| `GET` | `/users/:id` | Get single user by UUID | No | None |
| `POST` | `/users` | Create new user | Yes (JSON) | None |
| `PUT` | `/users/:id` | Update existing user | Yes (JSON) | None |
| `DELETE` | `/users/:id` | Delete user | No | None |

### **Query Parameters (GET /users):**
- `?limit=10` - How many users to return (max: 100)
- `?offset=0` - Skip first N users (pagination)
- `?role=student` - Filter by role (student/instructor)
- `?sort=name:asc` - Sort by field (name:asc, name:desc, createdAt:asc, createdAt:desc)

### **Example Requests:**
```http
GET /api/v1/users
GET /api/v1/users?limit=5&offset=10&role=student&sort=name:desc
GET /api/v1/users/11111111-1111-4111-8111-111111111111
POST /api/v1/users
PUT /api/v1/users/11111111-1111-4111-8111-111111111111
DELETE /api/v1/users/11111111-1111-4111-8111-111111111111
```

---

## 🏗️ Architecture Flow: How All Files Work Together

### **The Clean Architecture Pattern**

This project follows a **layered architecture** that separates concerns for maintainability, testability, and scalability.

```
HTTP Request → Routes → Middleware → Controllers → Services → Data Storage
                ↓
HTTP Response ← Response Helpers ← Controllers ← Services ← In-Memory Arrays
```

---

## 📁 File Structure and Responsibilities

```
src/
├── app.js                    # Express app configuration
├── config/
│   └── index.js             # Application configuration
├── controllers/
│   └── usersController.js   # HTTP request/response handling
├── middlewares/
│   ├── errorHandler.js      # Global error handling
│   └── validateRequest.js   # Request validation middleware
├── routes/
│   └── users.js            # URL routing and middleware attachment
├── services/
│   └── usersService.js     # Business logic and data management
├── utils/
│   └── responseHelpers.js  # Consistent JSON response formatting
└── validators/
    └── usersSchemas.js     # Data validation schemas
```

---

## 🔄 Complete Request Flow Analysis

Let's trace a **POST /api/v1/users** request through the entire system:

### **Step 1: Request Arrives at Express App**
```javascript
// server.js
const app = require('./src/app');
app.listen(3000);

// src/app.js
app.use(`${config.BASE_PATH}/users`, usersRoutes);
// Incoming: POST /api/v1/users
```

### **Step 2: Route Matching (`src/routes/users.js`)**
```javascript
const router = express.Router();

// This line matches our POST request
router.post('/', validate(createSchema), usersController.createUser);
//          ↑         ↑                    ↑
//      URL match  Validation           Controller
//                middleware            function
```

**What happens:**
- Express matches `POST /` (relative to `/api/v1/users`)
- Applies validation middleware first
- Then calls controller function

### **Step 3: Validation Middleware (`src/middlewares/validateRequest.js`)**
```javascript
const validate = (schema) => {
  return (req, res, next) => {
    // Validate request body against Joi schema
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // Get ALL validation errors
      stripUnknown: true    // Remove unknown fields
    });

    if (error) {
      error.isJoi = true;   // Flag for error handler
      return next(error);   // Send to error handler
    }

    req.body = value;       // Replace with cleaned data
    next();                 // Continue to controller
  };
};
```

**What happens:**
- Validates JSON against `createSchema` from `usersSchemas.js`
- If invalid: sends error to global error handler
- If valid: cleans data and continues to controller

### **Step 4: Validation Schema (`src/validators/usersSchemas.js`)**
```javascript
const createSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'any.required': 'Name is required'
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    
  role: Joi.string()
    .valid('student', 'instructor')
    .default('student')
});
```

**What happens:**
- Defines exactly what valid user data looks like
- Provides custom error messages for each validation rule
- Sets default values (role defaults to 'student')

### **Step 5: Controller Layer (`src/controllers/usersController.js`)**
```javascript
const createUser = async (req, res, next) => {
  try {
    // 1. Extract validated data (middleware already cleaned it)
    const userData = req.body;
    
    // 2. Call business logic layer
    const newUser = usersService.create(userData);
    
    // 3. Generate RESTful Location header
    const location = `/api/v1/users/${newUser.id}`;
    
    // 4. Send formatted response
    responseHelpers.createdResponse(res, newUser, location);
    
  } catch (error) {
    // 5. Forward any errors to global error handler
    next(error);
  }
};
```

**What happens:**
- **HTTP Layer**: Handles HTTP-specific concerns (headers, status codes)
- **Delegation**: Calls service layer for business logic
- **Response Formatting**: Uses helpers for consistent JSON structure
- **Error Handling**: Forwards errors without exposing internal details

### **Step 6: Service Layer (`src/services/usersService.js`)**
```javascript
// In-memory data storage (perfect for learning!)
let users = [
  { 
    id: '11111111-1111-4111-8111-111111111111', 
    name: 'Asha', 
    email: 'asha@example.com', 
    role: 'student', 
    createdAt: '2025-09-24T00:00:00.000Z' 
  },
  // ... more seeded users
];

const create = (payload) => {
  console.log('Creating new user:', payload.name);
  
  // Business Rule: Check for duplicate emails
  const existingUser = users.find(user => 
    user.email.toLowerCase() === payload.email.toLowerCase()
  );
  
  if (existingUser) {
    const error = new Error('Email already exists');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }

  // Create new user with generated ID and timestamp
  const newUser = {
    id: uuidv4(),                    // Generate unique ID
    name: payload.name,
    email: payload.email,
    role: payload.role || 'student', // Default role
    createdAt: new Date().toISOString()
  };

  // Save to in-memory storage
  users.push(newUser);
  return newUser;
};
```

**What happens:**
- **Business Logic**: Implements domain rules (no duplicate emails)
- **Data Management**: Handles CRUD operations on in-memory arrays
- **ID Generation**: Uses UUID for unique, non-sequential IDs
- **Timestamps**: Automatically adds creation timestamps

### **Step 7: Response Helper (`src/utils/responseHelpers.js`)**
```javascript
const createdResponse = (res, item, location) => {
  // Set RESTful Location header if provided
  if (location) {
    res.set('Location', location);
  }
  
  // Send 201 Created with consistent JSON structure
  res.status(201).json({
    data: item
  });
};
```

**What happens:**
- **Consistent Format**: All responses follow same JSON structure
- **HTTP Standards**: Sets appropriate status codes and headers
- **Location Header**: Tells client where to find the created resource

### **Step 8: Final Response**
```http
HTTP/1.1 201 Created
Location: /api/v1/users/a1b2c3d4-5678-4abc-8def-123456789012
Content-Type: application/json

{
  "data": {
    "id": "a1b2c3d4-5678-4abc-8def-123456789012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "createdAt": "2025-09-24T10:30:00.000Z"
  }
}
```

---

## 🚨 Error Handling Flow

### **Global Error Handler (`src/middlewares/errorHandler.js`)**
```javascript
const errorHandler = (err, req, res, next) => {
  // Log for debugging (never expose to client)
  console.error('Error occurred:', err.message);
  console.error('Stack:', err.stack);

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal Server Error';
  let details = [];

  // Handle different error types
  if (err.isJoi || err.name === 'ValidationError') {
    // Joi validation errors from middleware
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }
  else if (err.code === 'USER_NOT_FOUND') {
    // Custom business logic errors
    statusCode = 404;
    code = 'USER_NOT_FOUND';
    message = err.message;
  }
  // ... handle other error types

  // Send consistent error response
  res.status(statusCode).json({
    error: {
      message,
      code,
      details
    }
  });
};
```

### **Error Response Examples:**

**Validation Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

**Business Logic Error:**
```json
{
  "error": {
    "message": "Email already exists",
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
```

**Not Found Error:**
```json
{
  "error": {
    "message": "User with ID 99999999-9999-4999-8999-999999999999 not found",
    "code": "USER_NOT_FOUND",
    "details": []
  }
}
```

---

## 📋 Data Flow for Other Operations

### **GET /users (List with Query Parameters)**
```
1. Route: router.get('/', usersController.listUsers)
2. Controller: Extract & sanitize query params (limit, offset, role, sort)
3. Service: Apply filtering, sorting, pagination to in-memory array
4. Response: { meta: {limit, offset, total}, data: [users] }
```

### **GET /users/:id (Single User)**
```
1. Route: router.get('/:id', usersController.getUser)
2. Controller: Extract ID from URL params
3. Service: Array.find() by ID
4. Response: { data: user } or 404 error
```

### **PUT /users/:id (Update User)**
```
1. Route: router.put('/:id', validate(updateSchema), usersController.updateUser)
2. Middleware: Validate partial update data
3. Controller: Extract ID and update data
4. Service: Find user, merge data, check business rules
5. Response: { data: updatedUser } with updatedAt timestamp
```

### **DELETE /users/:id (Delete User)**
```
1. Route: router.delete('/:id', usersController.deleteUser)
2. Controller: Extract ID from params
3. Service: Array.splice() to remove user
4. Response: 204 No Content (empty body)
```

---

## 🎯 Key Learning Points for Students

### **1. Separation of Concerns**
Each file has a single, clear responsibility:

- **Routes** (`routes/users.js`): URL mapping and middleware orchestration
- **Controllers** (`controllers/usersController.js`): HTTP protocol handling
- **Services** (`services/usersService.js`): Business logic and data operations
- **Validators** (`validators/usersSchemas.js`): Data structure definitions
- **Middlewares** (`middlewares/`): Cross-cutting concerns (validation, errors)
- **Utils** (`utils/responseHelpers.js`): Reusable formatting functions

### **2. Data Flow Direction**
```
Request:  HTTP → Routes → Middleware → Controllers → Services → Data
Response: HTTP ← Helpers ← Controllers ← Services ← Data
Errors:   HTTP ← Error Handler ← Any Layer
```

### **3. Why This Architecture Works**

**✅ Testable**: Each layer can be unit tested independently
```javascript
// Test controller without HTTP
const result = usersController.listUsers(mockReq, mockRes, mockNext);

// Test service without HTTP
const users = usersService.list({ limit: 5, role: 'student' });
```

**✅ Maintainable**: Changes in one layer don't affect others
```javascript
// Change data storage from arrays to database?
// Only modify services/usersService.js
// Controllers, routes, validators stay the same!
```

**✅ Scalable**: Easy to add new features
```javascript
// Add authentication? Create new middleware
// Add new entity? Copy the users pattern
// Add caching? Modify service layer only
```

**✅ Professional**: Industry-standard patterns
- Clean Architecture principles
- Express.js best practices
- REST API conventions
- Error handling strategies

### **4. Common Patterns to Notice**

**Middleware Chain Pattern:**
```javascript
router.post('/', validate(createSchema), usersController.createUser);
//              ↑ middleware 1      ↑ middleware 2
```

**Dependency Injection Pattern:**
```javascript
// Controllers depend on services (injected via require)
const usersService = require('../services/usersService');
```

**Error Propagation Pattern:**
```javascript
// Every async function forwards errors up the chain
try {
  const result = await someOperation();
} catch (error) {
  next(error); // Let error handler deal with it
}
```

**Response Consistency Pattern:**
```javascript
// All responses use same JSON structure
{ data: {...} }           // Success responses
{ error: {...} }          // Error responses
{ meta: {...}, data: [...] } // List responses
```

---

## 🔧 Configuration Management

### **Environment Configuration (`src/config/index.js`)**
```javascript
module.exports = {
  PORT: process.env.PORT || 3000,
  BASE_PATH: '/api/v1'
};
```

**Benefits:**
- Centralized configuration
- Environment variable support
- Easy to modify for different deployments

---

## 💾 Data Storage Strategy

### **Why In-Memory Storage?**

For educational purposes, this project uses simple JavaScript arrays:

```javascript
let users = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Asha', ... },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Ravi', ... },
  { id: '33333333-3333-4333-8333-333333333333', name: 'Maya', ... }
];
```

**Advantages for Learning:**
- ✅ No database setup required
- ✅ Immediate results, no query complexity
- ✅ Students can see exactly where data lives
- ✅ Easy to modify and experiment with
- ✅ Data resets on server restart (teaches statelessness)

**Migration Path:**
When ready for production, only the service layer needs changes:
```javascript
// From:
const users = usersService.list();

// To:
const users = await db.users.findMany();
```

---

## 🧪 Testing the API

### **Manual Testing with curl:**
```bash
# List users
curl http://localhost:3000/api/v1/users

# Get single user
curl http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111

# Create user
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","role":"student"}'

# Update user
curl -X PUT http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111 \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha Patel","role":"instructor"}'

# Delete user
curl -X DELETE http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111
```

### **Testing with Postman:**
1. Import the `postman_collection.json` file
2. All endpoints are pre-configured with examples
3. Practice with different query parameters
4. Observe response formats and status codes

---

## 🎓 Assignment Ideas for Students

### **Beginner Level:**
1. **API Exploration**: Use Postman to test all endpoints
2. **Data Modification**: Change the seeded users in `usersService.js`
3. **Validation Testing**: Try invalid data and observe error messages

### **Intermediate Level:**
1. **Add New Field**: Add an `age` field with validation
2. **New Endpoint**: Create a health check endpoint
3. **Query Enhancement**: Add search by name functionality

### **Advanced Level:**
1. **New Entity**: Create a complete courses module (routes, controller, service, validation)
2. **Relationships**: Add user-course relationships
3. **Middleware**: Create a logging middleware
4. **Testing**: Write unit tests for each layer

---

## 📚 Additional Resources

### **Technologies Used:**
- **Express.js 4.18.2**: Web framework
- **Joi 17.11.0**: Schema validation
- **UUID 9.0.1**: Unique ID generation
- **CORS 2.8.5**: Cross-origin resource sharing

### **Key Concepts Demonstrated:**
- RESTful API design
- Clean Architecture
- Middleware pattern
- Error handling strategies
- Request validation
- Response formatting
- CRUD operations
- Query parameters
- HTTP status codes

---

*This guide provides a complete understanding of how modern web APIs are structured and built. Each component serves a specific purpose, and together they create a maintainable, scalable, and professional API that follows industry best practices.*