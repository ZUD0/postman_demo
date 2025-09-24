/**
 * Middleware to validate request data against a Joi schema
 * Forwards validation errors to the error handler for consistent formatting
 * @param {Object} schema - Joi schema object
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Get all validation errors
      stripUnknown: true // Remove unknown fields
    });

    if (error) {
      // Forward to error handler with validation flag
      error.isJoi = true;
      return next(error);
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = validate;