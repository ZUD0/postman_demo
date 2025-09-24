const usersService = require('../services/usersService');
const responseHelpers = require('../utils/responseHelpers');

/**
 * Users controller - handles HTTP requests and responses for classroom exercises
 * Uses async functions to allow easy database migration later
 */

/**
 * List all users with query parameter support
 * GET /api/v1/users?limit=10&offset=0&role=student&sort=name:asc
 */
const listUsers = async (req, res, next) => {
  try {
    const { limit, offset, role, sort } = req.query;
    
    // Parse query parameters
    const options = {
      limit: limit ? parseInt(limit) : 10,
      offset: offset ? parseInt(offset) : 0,
      role: role || undefined,
      sort: sort || undefined
    };
    
    const users = usersService.list(options);
    
    // Build metadata for response
    const meta = {
      limit: options.limit,
      offset: options.offset,
      total: users.length
    };
    
    if (options.role) meta.role = options.role;
    if (options.sort) meta.sort = options.sort;
    
    responseHelpers.listResponse(res, users, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single user by ID
 * GET /api/v1/users/:id
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = usersService.getById(id);
    
    if (!user) {
      const error = new Error(`User with ID ${id} not found`);
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      return next(error);
    }

    responseHelpers.itemResponse(res, user);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new user
 * POST /api/v1/users
 */
const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = usersService.create(userData);
    
    // Generate location header for RESTful best practices
    const location = `/api/v1/users/${newUser.id}`;
    
    responseHelpers.createdResponse(res, newUser, location);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing user (partial updates allowed)
 * PUT /api/v1/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedUser = usersService.update(id, updateData);
    
    if (!updatedUser) {
      const error = new Error(`User with ID ${id} not found`);
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      return next(error);
    }

    responseHelpers.itemResponse(res, updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a user
 * DELETE /api/v1/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = usersService.remove(id);
    
    if (!deleted) {
      const error = new Error(`User with ID ${id} not found`);
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;
      return next(error);
    }

    // Return 204 No Content for successful deletion
    responseHelpers.noContentResponse(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
};