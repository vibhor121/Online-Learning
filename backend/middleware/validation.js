const { body, param, query, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'instructor'])
    .withMessage('Role must be either student or instructor'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  handleValidationErrors
];

// Course validation rules
const validateCourseCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Course title must be between 5 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Course description must be between 50 and 2000 characters'),
  
  body('shortDescription')
    .trim()
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ min: 20, max: 200 })
    .withMessage('Short description must be between 20 and 200 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Course category is required')
    .isIn([
      'Programming', 'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography',
      'Music', 'Language', 'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('level')
    .notEmpty()
    .withMessage('Course level is required')
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced'),
  
  body('price')
    .custom((value) => {
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    })
    .withMessage('Price must be a valid number greater than or equal to 0'),
  
  body('duration')
    .custom((value) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= 1;
    })
    .withMessage('Duration must be a valid number greater than or equal to 1'),
  
  body('whatYouWillLearn')
    .custom((value) => {
      // Handle both array (JSON) and string (FormData) formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) && parsed.length > 0;
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value) && value.length > 0;
    })
    .withMessage('What you will learn must be a valid array with at least one item'),
  
  body('requirements')
    .optional()
    .custom((value) => {
      // Handle both array (JSON) and string (FormData) formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Requirements must be a valid array'),
  
  body('tags')
    .optional()
    .custom((value) => {
      // Handle both array (JSON) and string (FormData) formats
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed);
        } catch (e) {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be a valid array'),
  
  handleValidationErrors
];

const validateCourseUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Course title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Course description must be between 50 and 2000 characters'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ min: 20, max: 200 })
    .withMessage('Short description must be between 20 and 200 characters'),
  
  body('category')
    .optional()
    .isIn([
      'Programming', 'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography',
      'Music', 'Language', 'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Level must be Beginner, Intermediate, or Advanced'),
  
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .custom(value => value >= 0)
    .withMessage('Price cannot be negative'),
  
  handleValidationErrors
];

// Lesson validation rules
const validateLessonCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Lesson title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Lesson description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Lesson description must be between 10 and 1000 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Lesson type is required')
    .isIn(['video', 'text', 'quiz', 'assignment', 'document'])
    .withMessage('Invalid lesson type'),
  
  body('order')
    .isInt({ min: 1 })
    .withMessage('Lesson order must be a positive integer'),
  
  // Conditional validations based on lesson type
  body('content.videoUrl')
    .if(body('type').equals('video'))
    .notEmpty()
    .withMessage('Video URL is required for video lessons')
    .isURL()
    .withMessage('Please provide a valid video URL'),
  
  body('content.videoDuration')
    .if(body('type').equals('video'))
    .isInt({ min: 1 })
    .withMessage('Video duration must be at least 1 second'),
  
  body('content.textContent')
    .if(body('type').equals('text'))
    .notEmpty()
    .withMessage('Text content is required for text lessons')
    .isLength({ min: 50, max: 10000 })
    .withMessage('Text content must be between 50 and 10000 characters'),
  
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot be more than 500 characters'),
  
  handleValidationErrors
];

// Parameter validation rules
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID format`),
  
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateCourseFilters = [
  query('category')
    .optional()
    .isIn([
      'Programming', 'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'Design', 'Business', 'Marketing', 'Photography',
      'Music', 'Language', 'Other'
    ])
    .withMessage('Invalid category'),
  
  query('level')
    .optional()
    .isIn(['Beginner', 'Intermediate', 'Advanced'])
    .withMessage('Invalid level'),
  
  query('minPrice')
    .optional()
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('Minimum price cannot be negative'),
  
  query('maxPrice')
    .optional()
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('Maximum price cannot be negative'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'title', 'price', 'rating', 'enrollmentCount'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourseCreation,
  validateCourseUpdate,
  validateLessonCreation,
  validateReview,
  validateObjectId,
  validatePagination,
  validateCourseFilters
};
