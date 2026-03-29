/**
 * Global Error Handler Middleware
 * Catches all errors and returns a structured JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to terminal in red
  // Use ANSI escape code \x1b[31m for red text
  console.error('\x1b[31m%s\x1b[0m', `[ERROR] ${err.stack || err.message}`);

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: err.stack
  });
};

module.exports = errorHandler;
