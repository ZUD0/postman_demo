/**
 * Global error handling middleware for classroom-friendly error responses
 * Follows the specified error JSON format
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging (but don't leak stack traces to client)
  console.error('Error occurred:', err.message);
  console.error('Stack:', err.stack);

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal Server Error';
  let details = [];

  // Handle Joi validation errors
  if (err.isJoi || err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = err.details ? err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    })) : [];
  }
  // Handle custom business logic errors
  else if (err.code === 'VALIDATION_ERROR') {
    statusCode = err.statusCode || 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  }
  // Handle user not found errors
  else if (err.code === 'USER_NOT_FOUND') {
    statusCode = 404;
    code = 'USER_NOT_FOUND';
    message = err.message || 'User not found';
  }
  // Handle custom errors with statusCode
  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'CUSTOM_ERROR';
  }

  // Send standardized error response
  res.status(statusCode).json({
    error: {
      message,
      code,
      details
    }
  });
};

module.exports = errorHandler;