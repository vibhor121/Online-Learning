const express = require('express');
const router = express.Router();
const {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  markLessonCompleted,
  addLessonNote,
  getLessonNotes,
  toggleLessonPublish
} = require('../controllers/lessonController');
const { authenticate, isInstructor, optionalAuth } = require('../middleware/auth');
const {
  validateLessonCreation,
  validateObjectId
} = require('../middleware/validation');

// Routes with optional authentication
router.get('/course/:courseId', validateObjectId('courseId'), optionalAuth, getCourseLessons);
router.get('/:lessonId', validateObjectId('lessonId'), optionalAuth, getLessonById);

// Protected routes
router.use(authenticate); // All routes below require authentication

// Student routes
router.post('/:lessonId/complete', validateObjectId('lessonId'), markLessonCompleted);
router.post('/:lessonId/notes', validateObjectId('lessonId'), addLessonNote);
router.get('/:lessonId/notes', validateObjectId('lessonId'), getLessonNotes);

// Instructor routes
router.post('/course/:courseId', validateObjectId('courseId'), isInstructor, validateLessonCreation, createLesson);
router.put('/:lessonId', validateObjectId('lessonId'), isInstructor, updateLesson);
router.delete('/:lessonId', validateObjectId('lessonId'), isInstructor, deleteLesson);
router.patch('/:lessonId/publish', validateObjectId('lessonId'), isInstructor, toggleLessonPublish);

module.exports = router;



