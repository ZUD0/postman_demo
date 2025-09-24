const { v4: uuidv4 } = require('uuid');

/**
 * Users service - handles business logic and in-memory data storage
 * Uses UUID for IDs and includes classroom-friendly query parameters
 */

// In-memory data store seeded with 3 classroom users
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

/**
 * List users with query parameter support
 * @param {Object} options - Query options {limit, offset, role, sort}
 * @returns {Array} Array of users matching criteria
 */
const list = (options = {}) => {
  const { limit = 10, offset = 0, role, sort } = options;
  let result = [...users];

  // Filter by role if specified
  if (role) {
    result = result.filter(user => user.role === role);
  }

  // Sort if specified
  if (sort) {
    const [field, direction] = sort.split(':');
    if (field && (field === 'name' || field === 'createdAt')) {
      result.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    }
  }

  // Apply pagination
  return result.slice(offset, offset + limit);
};

/**
 * Get user by ID
 * @param {string} id - User UUID
 * @returns {Object|null} User object or null if not found
 */
const getById = (id) => {
  return users.find(user => user.id === id) || null;
};

/**
 * Create a new user
 * @param {Object} payload - User data (name, email, role)
 * @returns {Object} Created user object
 */
const create = (payload) => {
  console.log('Creating new user:', payload.name);
  
  // Check if email already exists
  const existingUser = users.find(user => user.email.toLowerCase() === payload.email.toLowerCase());
  if (existingUser) {
    const error = new Error('Email already exists');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }

  const newUser = {
    id: uuidv4(),
    name: payload.name,
    email: payload.email,
    role: payload.role || 'student',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  return newUser;
};

/**
 * Update an existing user
 * @param {string} id - User UUID
 * @param {Object} payload - Data to update
 * @returns {Object|null} Updated user object or null if not found
 */
const update = (id, payload) => {
  console.log('Updating user:', id);
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }

  // Check if email already exists (excluding current user)
  if (payload.email) {
    const existingUser = users.find(user => 
      user.email.toLowerCase() === payload.email.toLowerCase() && user.id !== id
    );
    if (existingUser) {
      const error = new Error('Email already exists');
      error.code = 'VALIDATION_ERROR';
      error.statusCode = 400;
      throw error;
    }
  }

  // Update user with new data and set updatedAt timestamp
  users[userIndex] = { 
    ...users[userIndex], 
    ...payload, 
    updatedAt: new Date().toISOString() 
  };
  
  return users[userIndex];
};

/**
 * Remove a user
 * @param {string} id - User UUID
 * @returns {boolean} True if user was deleted, false if not found
 */
const remove = (id) => {
  console.log('Deleting user:', id);
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return false;
  }

  users.splice(userIndex, 1);
  return true;
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};