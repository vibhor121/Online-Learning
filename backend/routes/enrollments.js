const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getUserEnrollments,
  getEnrollmentDetails,
  updateProgress,
  dropFromCourse,
  getCourseEnrollments,
  addEnrollmentNote,
  getEnrollmentStats
} = require('../controllers/enrollmentController');
const { authenticate, isInstructor } = require('../middleware/auth');
const {
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

// All enrollment routes require authentication
router.use(authenticate);

// Student routes
router.post('/course/:courseId', validateObjectId('courseId'), enrollInCourse);
router.get('/my-enrollments', validatePagination, getUserEnrollments);
router.get('/stats', getEnrollmentStats);
router.get('/:enrollmentId', validateObjectId('enrollmentId'), getEnrollmentDetails);
router.put('/:enrollmentId/progress', validateObjectId('enrollmentId'), updateProgress);
router.patch('/:enrollmentId/drop', validateObjectId('enrollmentId'), dropFromCourse);
router.post('/:enrollmentId/notes', validateObjectId('enrollmentId'), addEnrollmentNote);

// Instructor routes
router.get('/course/:courseId/enrollments', validateObjectId('courseId'), isInstructor, validatePagination, getCourseEnrollments);

module.exports = router;



