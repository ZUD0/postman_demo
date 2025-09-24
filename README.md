# Postman Demo API

A simple RESTful JSON API for classroom Postman exercises. This Express server provides user management endpoints perfect for learning REST API fundamentals.

## Prerequisites

Before you begin, make sure you have:

- **Node.js**: Check your version with:
  ```
  node -v
  ```
  You need Node.js 14.0.0 or higher.

- **Postman**: Download from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

## Quick Start

### Option 1: Run Locally

1. **Clone or download this project**
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Start the server:**
   ```
   npm start
   ```

You should see:
```
🚀 Server running at http://localhost:3000/api/v1
Ready for Postman exercises!
```

### Option 2: If You Don't Want to Run

If you prefer not to run the server locally, you can:
- Download this project as a ZIP file
- Extract it to your desktop
- Open the files in your code editor to read the code
- Use the Postman collection file (`postman_collection.json`) to explore the API structure

## API Endpoints

The server provides these endpoints for user management:

### List All Users
- **GET** `http://localhost:3000/api/v1/users`

Optional query parameters:
- `?limit=5` - Limit number of results
- `?offset=0` - Skip first N results  
- `?role=student` - Filter by role (student or instructor)
- `?sort=name:asc` - Sort by field (name:asc, name:desc, createdAt:asc, createdAt:desc)

Example: `http://localhost:3000/api/v1/users?limit=2&role=student`

Expected response:
```json
{
  "meta": {
    "limit": 10,
    "offset": 0,
    "total": 3
  },
  "data": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "name": "Asha",
      "email": "asha@example.com",
      "role": "student",
      "createdAt": "2025-09-24T00:00:00.000Z"
    },
    {
      "id": "22222222-2222-4222-8222-222222222222", 
      "name": "Ravi",
      "email": "ravi@example.com",
      "role": "student",
      "createdAt": "2025-09-24T00:00:00.000Z"
    }
  ]
}
```

### Get Single User
- **GET** `http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111`

Expected response:
```json
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

404 response example:
```json
{
  "error": {
    "message": "User with ID 99999999-9999-4999-8999-999999999999 not found",
    "code": "USER_NOT_FOUND",
    "details": []
  }
}
```

### Create New User
- **POST** `http://localhost:3000/api/v1/users`
- **Content-Type:** `application/json`

Request body:
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "role": "student"
}
```

Expected response (201 Created):
```json
{
  "data": {
    "id": "a1b2c3d4-5678-4abc-8def-123456789012",
    "name": "Alex Johnson", 
    "email": "alex@example.com",
    "role": "student",
    "createdAt": "2025-09-24T10:30:00.000Z"
  }
}
```

### Update User
- **PUT** `http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111`
- **Content-Type:** `application/json`

Request body (partial updates allowed):
```json
{
  "name": "Asha Patel",
  "role": "instructor"
}
```

Expected response:
```json
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

### Delete User
- **DELETE** `http://localhost:3000/api/v1/users/11111111-1111-4111-8111-111111111111`

Expected response: `204 No Content` (empty body)

## Troubleshooting

### Node.js Not Installed
If `node -v` doesn't work:
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Install the LTS version
3. Restart your terminal/command prompt

### Port Already in Use
If you see "port 3000 already in use":
1. Stop other applications using port 3000
2. Or change the port by setting an environment variable:
   ```
   set PORT=4000
   npm start
   ```
   (Then use `http://localhost:4000/api/v1` instead)

### Postman Issues
- **Import Collection**: Use File → Import → Upload the `postman_collection.json` file
- **JSON Parse Errors**: Set request header `Content-Type: application/json` for POST/PUT requests
- **Invalid JSON**: Use the JSON validator in Postman's request body tab

### Common Validation Errors
The API validates all input. Example validation error:
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

## Practice Exercises

Try these exercises to learn REST API fundamentals:

1. **Basic CRUD**: Create a user, read it back, update it, then delete it
2. **Query Parameters**: Get users with different limits, offsets, and filters  
3. **Error Handling**: Try invalid user IDs, malformed JSON, missing required fields
4. **Status Codes**: Notice the different HTTP status codes (200, 201, 204, 400, 404)
5. **Headers**: Observe the `Location` header in POST responses

## Project Structure

This project follows a clean architecture pattern. See the documentation in:
- [`src/README.md`](src/README.md) - Overview of the source code structure
- Individual folder READMEs for detailed explanations of each component

## Next Steps

- Explore the source code to understand how REST APIs work
- Try modifying the seeded user data in `src/services/usersService.js`
- Add new validation rules in `src/validators/usersSchemas.js`
- Practice with different Postman features like tests and environments