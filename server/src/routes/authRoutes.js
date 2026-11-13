const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  createAdmin,
  getMe,
  getAllAdmins,
} = require('../controllers/authController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Public auth routes
router.post('/login', loginAdmin);

// New Admin Creation Route (Backend API only, not exposed on frontend)
router.post('/create-admin', createAdmin);
router.post('/register-admin', createAdmin);

// Protected admin routes
router.get('/me', protectAdmin, getMe);
router.get('/admins', protectAdmin, getAllAdmins);

module.exports = router;
