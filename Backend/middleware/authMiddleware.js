const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

// protect — blocks non-logged-in users
const protect = async (req, res, next) => {
  try {
    let token;

    // JWT is sent in headers like: Authorization: Bearer <token>
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // "Bearer eyJhbGci..." → split by space → take index 1
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token provided');
    }

    // verify the token using our JWT_SECRET
    // if token is tampered or expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded = { id: 5, role: 'user', iat: ..., exp: ... }
    // fetch fresh user from DB (so we have latest data)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } // never attach password to req
    });

    if (!user) {
      res.status(401);
      throw new Error('User belonging to this token no longer exists');
    }

    // attach user to the request object
    // now any route using this middleware can access req.user
    req.user = user;
    next(); // move to the next middleware or route handler

  } catch (error) {
    next(error); // pass error to errorHandler
  }
};

// adminOnly — blocks non-admin users (use AFTER protect)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized, admin access required'));
  }
};

module.exports = { protect, adminOnly };