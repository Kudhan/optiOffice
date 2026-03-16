/**
 * asyncHandler utility to eliminate try-catch blocks in route handlers.
 * Wraps the function and catches any errors to pass them to the next middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
