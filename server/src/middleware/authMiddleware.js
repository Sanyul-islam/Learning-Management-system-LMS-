const jwt = require('jsonwebtoken');
const dataService = require('../services/dataService');

const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lms_secret_jwt_key_fallback_12345'
      );

      const admin = await dataService.admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: Admin account not found',
        });
      }

      req.admin = admin;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Token expired or invalid',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided in header',
    });
  }
};

module.exports = { protectAdmin };
