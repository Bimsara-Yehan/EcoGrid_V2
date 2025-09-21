// Standardized response utility for incineration subsystem

const sendSuccess = (res, data, message = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const sendError = (res, message, code = 'INTERNAL_ERROR', details = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
};

const sendValidationError = (res, message, details = null) => {
  return sendError(res, message, 'VALIDATION_ERROR', details, 400);
};

const sendNotFoundError = (res, message = 'Resource not found') => {
  return sendError(res, message, 'NOT_FOUND', null, 404);
};

const sendUnauthorizedError = (res, message = 'Unauthorized') => {
  return sendError(res, message, 'UNAUTHORIZED', null, 401);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError
};

