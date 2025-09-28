const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../config/jwt');

// Middleware to verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Find user by ID from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      message: 'Invalid token.' 
    });
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Access denied. Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}.` 
      });
    }

    next();
  };
};

// Middleware to check if user is instructor
const isInstructor = authorize('instructor', 'admin');

// Middleware to check if user is admin
const isAdmin = authorize('admin');

// Middleware to check if user is student or instructor (for course access)
const isStudentOrInstructor = authorize('student', 'instructor', 'admin');

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently ignore errors in optional auth
    console.log('Optional auth error:', error.message);
  }
  
  next();
};

// Middleware to check if user owns the resource or is admin
const checkOwnership = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.resource && req.resource[resourceUserField];
    
    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. You can only access your own resources.' 
    });
  };
};

// Middleware to validate enrollment access
const validateEnrollmentAccess = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Check if user is enrolled in the course or is the instructor
    const Enrollment = require('../models/Enrollment');
    const Course = require('../models/Course');

    const [enrollment, course] = await Promise.all([
      Enrollment.findOne({ student: userId, course: courseId, status: 'active' }),
      Course.findById(courseId).populate('instructor', '_id')
    ]);

    // Allow access if user is enrolled, is the instructor, or is admin
    if (enrollment || 
        (course && course.instructor._id.toString() === userId.toString()) ||
        req.user.role === 'admin') {
      req.enrollment = enrollment;
      req.course = course;
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied. You must be enrolled in this course to access its content.' 
    });
  } catch (error) {
    console.error('Enrollment validation error:', error);
    return res.status(500).json({ 
      message: 'Error validating course access.' 
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  isInstructor,
  isAdmin,
  isStudentOrInstructor,
  optionalAuth,
  checkOwnership,
  validateEnrollmentAccess
};



