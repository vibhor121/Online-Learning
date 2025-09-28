const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Create a new lesson (instructor only)
const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessonData = {
      ...req.body,
      course: courseId
    };

    // Check if course exists and user is the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only create lessons for your own courses.'
      });
    }

    // Check if lesson order already exists
    const existingLesson = await Lesson.findOne({
      course: courseId,
      order: lessonData.order
    });

    if (existingLesson) {
      return res.status(400).json({
        message: 'A lesson with this order already exists. Please choose a different order.'
      });
    }

    const lesson = new Lesson(lessonData);
    await lesson.save();

    // Add lesson to course
    await Course.findByIdAndUpdate(courseId, {
      $push: { lessons: lesson._id }
    });

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      message: 'Error creating lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all lessons for a course
const getCourseLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user ? req.user._id : null;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Check if user has access to the course
    let hasAccess = false;
    let enrollment = null;

    if (userId) {
      // Check if user is enrolled or is the instructor
      if (course.instructor.toString() === userId.toString() || req.user.role === 'admin') {
        hasAccess = true;
      } else {
        enrollment = await Enrollment.findOne({
          student: userId,
          course: courseId,
          status: 'active'
        });
        hasAccess = !!enrollment;
      }
    }

    // Build lesson query
    const lessonQuery = { course: courseId };
    
    // If user doesn't have access, only show preview lessons
    if (!hasAccess) {
      lessonQuery.isPreview = true;
    }

    const lessons = await Lesson.find(lessonQuery)
      .select('-completions -notes') // Exclude user-specific data for performance
      .sort({ order: 1 });

    // Add completion status for enrolled users
    const lessonsWithProgress = lessons.map(lesson => {
      const lessonObj = lesson.toObject();
      
      if (enrollment) {
        const completion = enrollment.progress.completedLessons.find(
          comp => comp.lesson.toString() === lesson._id.toString()
        );
        lessonObj.isCompleted = !!completion;
        lessonObj.completedAt = completion ? completion.completedAt : null;
        lessonObj.userScore = completion ? completion.score : null;
      }
      
      return lessonObj;
    });

    res.json({
      message: 'Lessons retrieved successfully',
      lessons: lessonsWithProgress,
      hasAccess,
      totalLessons: await Lesson.countDocuments({ course: courseId })
    });

  } catch (error) {
    console.error('Get course lessons error:', error);
    res.status(500).json({
      message: 'Error retrieving lessons',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single lesson by ID
const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user ? req.user._id : null;

    const lesson = await Lesson.findById(lessonId)
      .populate('course', 'title instructor');

    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check access permissions
    let hasAccess = false;
    let enrollment = null;

    if (userId) {
      // Check if user is the instructor or admin
      if (lesson.course.instructor.toString() === userId.toString() || req.user.role === 'admin') {
        hasAccess = true;
      } else {
        // Check if user is enrolled
        enrollment = await Enrollment.findOne({
          student: userId,
          course: lesson.course._id,
          status: 'active'
        });
        hasAccess = !!enrollment;
      }
    }

    // If user doesn't have access and lesson is not preview, deny access
    if (!hasAccess && !lesson.isPreview) {
      return res.status(403).json({
        message: 'Access denied. You must be enrolled in this course to view this lesson.'
      });
    }

    // Add user-specific data if enrolled
    const lessonObj = lesson.toObject();
    if (enrollment) {
      const completion = enrollment.progress.completedLessons.find(
        comp => comp.lesson.toString() === lessonId
      );
      lessonObj.isCompleted = !!completion;
      lessonObj.completedAt = completion ? completion.completedAt : null;
      lessonObj.userScore = completion ? completion.score : null;

      // Get user notes for this lesson
      lessonObj.userNotes = lesson.notes.filter(
        note => note.user.toString() === userId.toString()
      );
    }

    res.json({
      message: 'Lesson retrieved successfully',
      lesson: lessonObj,
      hasAccess
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      message: 'Error retrieving lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update lesson (instructor only)
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateData = req.body;

    const lesson = await Lesson.findById(lessonId).populate('course', 'instructor');
    
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only update lessons for your own courses.'
      });
    }

    // If updating order, check for conflicts
    if (updateData.order && updateData.order !== lesson.order) {
      const existingLesson = await Lesson.findOne({
        course: lesson.course._id,
        order: updateData.order,
        _id: { $ne: lessonId }
      });

      if (existingLesson) {
        return res.status(400).json({
          message: 'A lesson with this order already exists.'
        });
      }
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Lesson updated successfully',
      lesson: updatedLesson
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      message: 'Error updating lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete lesson (instructor only)
const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate('course', 'instructor');
    
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only delete lessons from your own courses.'
      });
    }

    // Remove lesson from course
    await Course.findByIdAndUpdate(lesson.course._id, {
      $pull: { lessons: lessonId }
    });

    // Delete lesson
    await Lesson.findByIdAndDelete(lessonId);

    res.json({
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      message: 'Error deleting lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Mark lesson as completed
const markLessonCompleted = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { timeSpent = 0, score = null } = req.body;
    const userId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Find user's enrollment for this course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: lesson.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        message: 'You must be enrolled in this course to mark lessons as completed'
      });
    }

    // Mark lesson as completed in enrollment
    enrollment.completeLesson(lessonId, score, timeSpent);
    await enrollment.updateProgress();

    // Also mark in lesson model for tracking
    lesson.markCompleted(userId, score, timeSpent);
    await lesson.save();

    res.json({
      message: 'Lesson marked as completed',
      progress: {
        completionPercentage: enrollment.completion.completionPercentage,
        isCompleted: enrollment.completion.isCompleted
      }
    });

  } catch (error) {
    console.error('Mark lesson completed error:', error);
    res.status(500).json({
      message: 'Error marking lesson as completed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add note to lesson
const addLessonNote = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { content, timestamp } = req.body;
    const userId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: lesson.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        message: 'You must be enrolled in this course to add notes'
      });
    }

    // Add note
    lesson.addNote(userId, content, timestamp);
    await lesson.save();

    const addedNote = lesson.notes[lesson.notes.length - 1];

    res.json({
      message: 'Note added successfully',
      note: addedNote
    });

  } catch (error) {
    console.error('Add lesson note error:', error);
    res.status(500).json({
      message: 'Error adding note',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's notes for a lesson
const getLessonNotes = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user._id;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: lesson.course,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        message: 'You must be enrolled in this course to view notes'
      });
    }

    // Get user's notes for this lesson
    const userNotes = lesson.notes
      .filter(note => note.user.toString() === userId.toString())
      .sort((a, b) => a.timestamp - b.timestamp);

    res.json({
      message: 'Notes retrieved successfully',
      notes: userNotes
    });

  } catch (error) {
    console.error('Get lesson notes error:', error);
    res.status(500).json({
      message: 'Error retrieving notes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle lesson publish status
const toggleLessonPublish = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId).populate('course', 'instructor');
    
    if (!lesson) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Check if user is the instructor or admin
    if (lesson.course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    // Toggle published status
    lesson.isPublished = !lesson.isPublished;
    await lesson.save();

    res.json({
      message: `Lesson ${lesson.isPublished ? 'published' : 'unpublished'} successfully`,
      lesson
    });

  } catch (error) {
    console.error('Toggle lesson publish error:', error);
    res.status(500).json({
      message: 'Error updating lesson status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  deleteLesson,
  markLessonCompleted,
  addLessonNote,
  getLessonNotes,
  toggleLessonPublish
};



