const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  addReview,
  getInstructorCourses
} = require('../controllers/courseController');
const { authenticate, isInstructor, optionalAuth } = require('../middleware/auth');
const {
  validateCourseCreation,
  validateCourseUpdate,
  validateReview,
  validateObjectId,
  validatePagination,
  validateCourseFilters
} = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, validatePagination, validateCourseFilters, getAllCourses);
router.get('/:courseId', validateObjectId('courseId'), optionalAuth, getCourseById);

// Protected routes
router.use(authenticate); // All routes below require authentication

// Student/General user routes
router.post('/:courseId/review', validateObjectId('courseId'), validateReview, addReview);

// Instructor routes
router.post('/', isInstructor, uploadSingle('thumbnail'), validateCourseCreation, createCourse);
router.get('/instructor/my-courses', isInstructor, validatePagination, getInstructorCourses);
router.put('/:courseId', validateObjectId('courseId'), isInstructor, validateCourseUpdate, updateCourse);
router.delete('/:courseId', validateObjectId('courseId'), isInstructor, deleteCourse);
router.patch('/:courseId/publish', validateObjectId('courseId'), isInstructor, togglePublishCourse);

module.exports = router;
