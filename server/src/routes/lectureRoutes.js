const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getLecturesByCourse,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
} = require('../controllers/lectureController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Nested under /api/courses/:courseId/lectures OR direct under /api/lectures
router.route('/')
  .get(getLecturesByCourse)
  .post(protectAdmin, createLecture);

router.route('/:id')
  .get(getLectureById)
  .put(protectAdmin, updateLecture)
  .delete(protectAdmin, deleteLecture);

module.exports = router;

