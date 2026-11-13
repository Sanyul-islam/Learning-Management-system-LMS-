const dataService = require('../services/dataService');

// @desc    Get all courses (with optional search)
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res, next) => {
  try {
    const { search } = req.query;
    const courses = await dataService.course.findAll(search);

    return res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID with lectures
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res, next) => {
  try {
    const course = await dataService.course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    return res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin)
const createCourse = async (req, res, next) => {
  try {
    const { title, description, price, thumbnail } = req.body;

    if (!title || !description || price === undefined || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, price, and thumbnail URL',
      });
    }

    const course = await dataService.course.create({
      title,
      description,
      price,
      thumbnail,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
const updateCourse = async (req, res, next) => {
  try {
    const { title, description, price, thumbnail } = req.body;

    const course = await dataService.course.update(req.params.id, {
      title,
      description,
      price,
      thumbnail,
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    return res.json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course and its associated lectures
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
const deleteCourse = async (req, res, next) => {
  try {
    const result = await dataService.course.delete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    return res.json({
      success: true,
      message: `Course and associated lectures deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
