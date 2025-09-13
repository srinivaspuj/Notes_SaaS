const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  
  return jwt.verify(token, JWT_SECRET);
}

function requireAuth(handler) {
  return (req, res) => {
    try {
      const decoded = verifyToken(req);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

function requireRole(role) {
  return (handler) => requireAuth((req, res) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return handler(req, res);
  });
}

module.exports = { verifyToken, requireAuth, requireRole };