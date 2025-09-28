const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Enroll in a course
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        message: 'Course is not published'
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        message: 'You are already enrolled in this course'
      });
    }

    // Check if user is the instructor
    if (course.instructor.toString() === studentId.toString()) {
      return res.status(400).json({
        message: 'Instructors cannot enroll in their own courses'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      payment: {
        amount: course.price,
        currency: course.currency,
        method: course.price === 0 ? 'free' : 'credit_card',
        status: course.price === 0 ? 'completed' : 'pending'
      }
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    // Add enrollment to user's enrollments
    await User.findByIdAndUpdate(studentId, {
      $push: { enrollments: enrollment._id }
    });

    // Populate enrollment data
    await enrollment.populate([
      { path: 'course', select: 'title thumbnail instructor duration' },
      { path: 'student', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      message: 'Error enrolling in course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's enrollments
const getUserEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { student: userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(filter)
        .populate({
          path: 'course',
          select: 'title thumbnail description instructor duration averageRating enrollmentCount',
          populate: {
            path: 'instructor',
            select: 'firstName lastName'
          }
        })
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Enrollment.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalEnrollments / parseInt(limit));

    res.json({
      message: 'Enrollments retrieved successfully',
      enrollments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEnrollments,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get user enrollments error:', error);
    res.status(500).json({
      message: 'Error retrieving enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get specific enrollment details
const getEnrollmentDetails = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({
        path: 'course',
        populate: [
          {
            path: 'instructor',
            select: 'firstName lastName avatar bio'
          },
          {
            path: 'lessons',
            select: 'title description type order isPreview duration',
            options: { sort: { order: 1 } }
          }
        ]
      })
      .populate('student', 'firstName lastName email');

    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.student._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    res.json({
      message: 'Enrollment details retrieved successfully',
      enrollment
    });

  } catch (error) {
    console.error('Get enrollment details error:', error);
    res.status(500).json({
      message: 'Error retrieving enrollment details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update enrollment progress
const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { lessonId, timeSpent = 0, score = null } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Mark lesson as completed
    enrollment.completeLesson(lessonId, score, timeSpent);
    
    // Update overall progress
    await enrollment.updateProgress();

    res.json({
      message: 'Progress updated successfully',
      enrollment: {
        progress: enrollment.progress,
        completion: enrollment.completion
      }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      message: 'Error updating progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Drop from course
const dropFromCourse = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user._id;

    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Check if course is already completed
    if (enrollment.completion.isCompleted) {
      return res.status(400).json({
        message: 'Cannot drop from a completed course'
      });
    }

    // Update enrollment status
    enrollment.status = 'dropped';
    await enrollment.save();

    // Decrease course enrollment count
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { enrollmentCount: -1 }
    });

    res.json({
      message: 'Successfully dropped from course'
    });

  } catch (error) {
    console.error('Drop from course error:', error);
    res.status(500).json({
      message: 'Error dropping from course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get course enrollments (for instructors)
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Build filter
    const filter = { course: courseId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [enrollments, totalEnrollments] = await Promise.all([
      Enrollment.find(filter)
        .populate('student', 'firstName lastName email avatar')
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Enrollment.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalEnrollments / parseInt(limit));

    res.json({
      message: 'Course enrollments retrieved successfully',
      enrollments,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEnrollments,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get course enrollments error:', error);
    res.status(500).json({
      message: 'Error retrieving course enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add note to enrollment
const addEnrollmentNote = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        message: 'Enrollment not found'
      });
    }

    // Check if user owns this enrollment
    if (enrollment.student.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Add note
    enrollment.addNote(content);
    await enrollment.save();

    res.json({
      message: 'Note added successfully',
      note: enrollment.notes[enrollment.notes.length - 1]
    });

  } catch (error) {
    console.error('Add enrollment note error:', error);
    res.status(500).json({
      message: 'Error adding note',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get enrollment statistics (for dashboard)
const getEnrollmentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Enrollment.aggregate([
      { $match: { student: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalTimeSpent: { $sum: '$progress.totalTimeSpent' },
          avgCompletion: { $avg: '$completion.completionPercentage' }
        }
      }
    ]);

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({ student: userId })
      .populate('course', 'title thumbnail')
      .sort({ 'progress.lastAccessedAt': -1 })
      .limit(5);

    // Get completed courses count
    const completedCourses = await Enrollment.countDocuments({
      student: userId,
      status: 'completed'
    });

    res.json({
      message: 'Enrollment statistics retrieved successfully',
      stats: {
        byStatus: stats,
        completedCourses,
        recentEnrollments
      }
    });

  } catch (error) {
    console.error('Get enrollment stats error:', error);
    res.status(500).json({
      message: 'Error retrieving enrollment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  enrollInCourse,
  getUserEnrollments,
  getEnrollmentDetails,
  updateProgress,
  dropFromCourse,
  getCourseEnrollments,
  addEnrollmentNote,
  getEnrollmentStats
};
