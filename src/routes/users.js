const express = require('express');
const usersController = require('../controllers/usersController');
const validate = require('../middlewares/validateRequest');
const { createSchema, updateSchema } = require('../validators/usersSchemas');

const router = express.Router();

/**
 * Users routes for classroom REST API exercises
 * Base path: /api/v1/users
 */

// GET / - List users with query parameter support
router.get('/', usersController.listUsers);

// GET /:id - Get user by ID
router.get('/:id', usersController.getUser);

// POST / - Create new user
router.post('/', validate(createSchema), usersController.createUser);

// PUT /:id - Update user (partial allowed)
router.put('/:id', validate(updateSchema), usersController.updateUser);

// DELETE /:id - Delete user
router.delete('/:id', usersController.deleteUser);

module.exports = router;