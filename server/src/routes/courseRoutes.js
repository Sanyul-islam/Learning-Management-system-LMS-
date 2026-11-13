const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllCourses)
  .post(protectAdmin, createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(protectAdmin, updateCourse)
  .delete(protectAdmin, deleteCourse);

module.exports = router;

