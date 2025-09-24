const Joi = require('joi');

/**
 * Joi schemas for user validation in classroom environment
 */

// Schema for creating a new user (POST)
const createSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required'
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
    
  role: Joi.string()
    .valid('student', 'instructor')
    .default('student')
    .messages({
      'any.only': 'Role must be either "student" or "instructor"'
    })
});

// Schema for updating a user (PUT) - all fields optional
const updateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters'
    }),
    
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
    
  role: Joi.string()
    .valid('student', 'instructor')
    .messages({
      'any.only': 'Role must be either "student" or "instructor"'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  createSchema,
  updateSchema
};