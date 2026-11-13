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

// @desc    Create / Register a new admin account (Backend API route)
// @route   POST /api/auth/create-admin or POST /api/auth/register-admin
// @access  Public (or called by administrative script / Postman)
const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password for the new admin',
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingAdmin = await dataService.admin.findByEmail(normalizedEmail);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin account with this email already exists',
      });
    }

    const adminName = name && name.trim() ? name.trim() : 'Administrator';
    const newAdmin = await dataService.admin.create({
      name: adminName,
      email: normalizedEmail,
      password,
      role: 'admin',
    });

    const token = generateToken(newAdmin._id);

    return res.status(201).json({
      success: true,
      message: 'New admin account created successfully',
      data: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        token,
      },
    });
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

// @desc    Get list of all admin accounts
// @route   GET /api/auth/admins
// @access  Private (Admin)
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await dataService.admin.findAll();
    return res.json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  createAdmin,
  getMe,
  getAllAdmins,
};
