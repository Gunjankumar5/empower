const jwt = require('jsonwebtoken');

const sendAuthError = (res, message, status = 401) => {
  return res.status(status).json({ success: false, error: message });
};

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return sendAuthError(res, 'Authentication token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return sendAuthError(res, 'Invalid or expired token');
  }
};

module.exports = authMiddleware;