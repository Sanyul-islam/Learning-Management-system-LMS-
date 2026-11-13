const jwt = require('jsonwebtoken');
const dataService = require('../services/dataService');

const generateToken = (id) => {
  return jwt.sign(
    { id, role: 'admin' },
    process.env.JWT_SECRET || 'lms_secret_jwt_key_fallback_12345',
    {
      expiresIn: '7d',
    }
  );
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const admin = await dataService.admin.findByEmail(email);

    if (admin && (await dataService.admin.matchPassword(admin, password))) {
      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in admin profile
// @route   GET /api/auth/me
// @access  Private (Admin)
const getMe = async (req, res) => {
  return res.json({
    success: true,
    data: req.admin,
  });
};

module.exports = {
  loginAdmin,
  getMe,
};
