// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Read the Authorization header from the incoming request
  // Standard format: "Bearer <YOUR_JWT_TOKEN>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 1. If no token is provided, block access immediately
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // 2. Verify token using your JWT_SECRET key
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_12345'
    );
    
    // 3. Attach the decoded userId to the request object
    req.userId = decoded.userId;
    
    // 4. Call next() to allow the request to proceed to the route handler
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authenticateToken;