# Validators (`src/validators/`)

This folder contains input validation schemas using Joi. Validators ensure that incoming data meets requirements before it reaches your business logic.

## Files

### `usersSchemas.js` - User Validation Schemas
This file defines Joi schemas for validating user data in requests.

## Validation Schemas

### `createSchema` - For Creating Users (POST)
Used when creating new users. All required fields must be provided.

```javascript
const createSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required(),
    
  email: Joi.string()
    .email()
    .required(),
    
  role: Joi.string()
    .valid('student', 'instructor')
    .default('student')
});
```

**Field Requirements:**
- **`name`**: Required string, 2-50 characters
- **`email`**: Required valid email address
- **`role`**: Optional, must be "student" or "instructor", defaults to "student"

**Valid Request:**
```javascript
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "role": "student"
}
```

**Invalid Request & Error:**
```javascript
// Request:
{
  "name": "A",                    // Too short
  "email": "not-an-email",        // Invalid format
  "extra": "unknown field"        // Not allowed
}

// Response (400 Bad Request):
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "name",
        "message": "Name must be at least 2 characters long"
      },
      {
        "field": "email", 
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

### `updateSchema` - For Updating Users (PUT)
Used when updating existing users. All fields are optional, but at least one must be provided.

```javascript
const updateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50),
    
  email: Joi.string()
    .email(),
    
  role: Joi.string()
    .valid('student', 'instructor')
}).min(1);  // At least one field required
```

**Field Requirements:**
- **`name`**: Optional string, 2-50 characters if provided
- **`email`**: Optional valid email if provided  
- **`role`**: Optional, must be "student" or "instructor" if provided
- **Minimum**: At least one field must be provided

**Valid Requests:**
```javascript
// Update just the name
{
  "name": "Alex Smith"
}

// Update multiple fields
{
  "name": "Alex Smith",
  "role": "instructor"
}
```

**Invalid Request:**
```javascript
// Empty request body
{}

// Response:
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "",
        "message": "At least one field must be provided for update"
      }
    ]
  }
}
```

## Custom Error Messages

Joi schemas include custom error messages to help users understand what went wrong:

```javascript
name: Joi.string()
  .min(2)
  .max(50)
  .required()
  .messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long', 
    'string.max': 'Name must not exceed 50 characters',
    'any.required': 'Name is required'
  })
```

## How Validation Works

### 1. Request Flow
```
POST /api/v1/users → validate(createSchema) → usersController.createUser
                     │
                     └── If invalid, returns 400 error
                     └── If valid, continues to controller
```

### 2. Middleware Processing
The `validateRequest` middleware processes the schema:

```javascript
// In validateRequest middleware
const { error, value } = schema.validate(req.body, {
  abortEarly: false,    // Get all validation errors
  stripUnknown: true    // Remove unknown fields
});

if (error) {
  error.isJoi = true;   // Mark as validation error
  return next(error);   // Forward to error handler
}

req.body = value;       // Replace with cleaned data
next();                 // Continue to controller
```

### 3. Error Handler Processing
The error handler recognizes Joi errors and formats them:

```javascript
// In errorHandler middleware
if (err.isJoi || err.name === 'ValidationError') {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  message = 'Validation failed';
  details = err.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message
  }));
}
```

## Benefits of Joi Validation

### Data Cleaning
Joi removes unknown fields and converts data types:

```javascript
// Input:
{
  "name": "Alex",
  "email": "alex@example.com",
  "age": 25,           // Unknown field - removed
  "role": "student",
  "extra": "data"      // Unknown field - removed
}

// Cleaned output (req.body):
{
  "name": "Alex",
  "email": "alex@example.com", 
  "role": "student"
}
```

### Default Values
Schemas can provide default values:

```javascript
role: Joi.string()
  .valid('student', 'instructor')
  .default('student')    // If not provided, defaults to 'student'
```

### Type Conversion
Joi automatically converts compatible types:

```javascript
age: Joi.number().integer()

// Input: "25" (string)
// Output: 25 (number)
```

## Common Joi Patterns

### String Validation
```javascript
name: Joi.string()
  .min(2)                    // Minimum length
  .max(50)                   // Maximum length  
  .trim()                    // Remove whitespace
  .required()                // Cannot be undefined/null
```

### Email Validation
```javascript
email: Joi.string()
  .email()                   // Valid email format
  .lowercase()               // Convert to lowercase
  .required()
```

### Enum Values
```javascript
role: Joi.string()
  .valid('student', 'instructor', 'admin')  // Only these values allowed
  .default('student')
```

### Conditional Validation
```javascript
const schema = Joi.object({
  role: Joi.string().valid('student', 'instructor'),
  graduationYear: Joi.when('role', {
    is: 'student',
    then: Joi.number().integer().min(2020).required(),
    otherwise: Joi.forbidden()
  })
});
```

### Nested Objects
```javascript
const schema = Joi.object({
  user: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required()
  }).required(),
  
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark').default('light'),
    notifications: Joi.boolean().default(true)
  }).optional()
});
```

## Testing Validation

Validation schemas can be tested independently:

```javascript
const { createSchema } = require('../validators/usersSchemas');

test('createSchema validates valid user data', () => {
  const validData = {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'student'
  };
  
  const { error, value } = createSchema.validate(validData);
  
  expect(error).toBeUndefined();
  expect(value.name).toBe('Alex Johnson');
  expect(value.role).toBe('student');
});

test('createSchema rejects invalid email', () => {
  const invalidData = {
    name: 'Alex Johnson',
    email: 'not-an-email'
  };
  
  const { error } = createSchema.validate(invalidData);
  
  expect(error).toBeDefined();
  expect(error.details[0].path).toEqual(['email']);
});
```

## Why Validation Exists

Validation provides several critical benefits:

- **Security**: Prevents malicious or malformed data from reaching your database
- **Data Integrity**: Ensures all data meets business requirements
- **User Experience**: Provides clear, helpful error messages
- **Developer Experience**: Catches errors early in the request pipeline
- **Documentation**: Schemas serve as documentation for your API

## Adding New Validation

To add validation for a new field:

1. **Add to schema:**
```javascript
phoneNumber: Joi.string()
  .pattern(/^\+?[1-9]\d{1,14}$/)  // International phone format
  .messages({
    'string.pattern.base': 'Please provide a valid phone number'
  })
```

2. **Test the validation:**
```javascript
const validData = { phoneNumber: '+1234567890' };
const invalidData = { phoneNumber: 'abc123' };
```

3. **Update documentation** to reflect the new field requirements.

## Related Documentation

- [`../middlewares/README.md`](../middlewares/README.md) - How validateRequest middleware uses these schemas
- [`../routes/README.md`](../routes/README.md) - How routes apply validation
- [`../controllers/README.md`](../controllers/README.md) - How controllers receive validated data
- [Joi Documentation](https://joi.dev/api/) - Complete Joi API reference