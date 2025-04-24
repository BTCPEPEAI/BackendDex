const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'your_secret_key';

exports.verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = (req, res, next) => {
  // This should be replaced with real token/auth logic
  const isAuthenticated = true;
  if (!isAuthenticated) return res.status(401).json({ message: 'Unauthorized' });
  next();
};
