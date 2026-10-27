// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'An unexpected server error occurred';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(val => val.message);
    message = messages.join(', ');
  }

  // Handle Mongoose invalid ObjectId cast error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Transaction not found with the specified ID';
  }

  // Send uniform error response without leaking stack trace to client
  res.status(statusCode).json({
    error: message
  });
};

module.exports = errorHandler;
