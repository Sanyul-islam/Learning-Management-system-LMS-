const dataService = require('../services/dataService');

// @desc    Get all lectures for a specific course
// @route   GET /api/courses/:courseId/lectures
// @access  Public
const getLecturesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await dataService.course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const lectures = await dataService.lecture.findByCourse(courseId);

    return res.json({
      success: true,
      count: lectures.length,
      data: lectures,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lecture by ID
// @route   GET /api/lectures/:id
// @access  Public
const getLectureById = async (req, res, next) => {
  try {
    const lecture = await dataService.lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    return res.json({
      success: true,
      data: lecture,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new lecture for a course
// @route   POST /api/courses/:courseId/lectures
// @access  Private (Admin)
const createLecture = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, videoUrl, order } = req.body;

    const course = await dataService.course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found',
      });
    }

    if (!title || !description || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and video URL',
      });
    }

    const lecture = await dataService.lecture.create({
      courseId,
      title,
      description,
      videoUrl,
      order,
    });

    return res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: lecture,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing lecture
// @route   PUT /api/lectures/:id
// @access  Private (Admin)
const updateLecture = async (req, res, next) => {
  try {
    const { title, description, videoUrl, order } = req.body;

    const lecture = await dataService.lecture.update(req.params.id, {
      title,
      description,
      videoUrl,
      order,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    return res.json({
      success: true,
      message: 'Lecture updated successfully',
      data: lecture,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a lecture
// @route   DELETE /api/lectures/:id
// @access  Private (Admin)
const deleteLecture = async (req, res, next) => {
  try {
    const deleted = await dataService.lecture.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    return res.json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLecturesByCourse,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture,
};
