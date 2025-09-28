const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { cleanupFiles } = require('../middleware/upload');

// Get all courses with filtering, sorting, and pagination
const getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      level,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      instructor
    } = req.query;

    // Build filter object
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [courses, totalCourses] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'firstName lastName avatar')
        .select('-reviews') // Exclude reviews for performance
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCourses / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      message: 'Courses retrieved successfully',
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCourses,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      message: 'Error retrieving courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single course by ID
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('instructor', 'firstName lastName avatar bio')
      .populate({
        path: 'lessons',
        select: 'title description type order isPreview duration',
        options: { sort: { order: 1 } }
      })
      .populate({
        path: 'reviews.user',
        select: 'firstName lastName avatar'
      });

    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Check if current user is enrolled (if authenticated)
    let isEnrolled = false;
    let enrollment = null;

    if (req.user) {
      enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
        status: 'active'
      });
      isEnrolled = !!enrollment;
    }

    // If user is not enrolled and not the instructor, hide non-preview lessons
    if (!isEnrolled && (!req.user || course.instructor._id.toString() !== req.user._id.toString())) {
      course.lessons = course.lessons.filter(lesson => lesson.isPreview);
    }

    res.json({
      message: 'Course retrieved successfully',
      course,
      isEnrolled,
      enrollment: enrollment ? {
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
        completion: enrollment.completion
      } : null
    });

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      message: 'Error retrieving course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new course (instructor only)
const createCourse = async (req, res) => {
  try {
    let thumbnailUrl = req.body.thumbnail; // Default or provided thumbnail
    let cloudinaryPublicId = null;

    // Handle image upload if file is provided
    if (req.file) {
      console.log('Uploading course thumbnail to Cloudinary...');
      const uploadResult = await uploadImage(req.file.path, 'courses');
      
      // Clean up temporary file
      cleanupFiles(req.file);
      
      if (uploadResult.success) {
        thumbnailUrl = uploadResult.url;
        cloudinaryPublicId = uploadResult.publicId;
        console.log('✅ Course thumbnail uploaded successfully:', thumbnailUrl);
      } else {
        console.error('❌ Cloudinary upload failed:', uploadResult.error);
        return res.status(500).json({
          message: 'Failed to upload course image',
          error: uploadResult.error
        });
      }
    }

    // Parse JSON fields from FormData
    let whatYouWillLearn = [];
    let requirements = [];
    let tags = [];

    try {
      if (req.body.whatYouWillLearn) {
        whatYouWillLearn = JSON.parse(req.body.whatYouWillLearn);
      }
      if (req.body.requirements) {
        requirements = JSON.parse(req.body.requirements);
      }
      if (req.body.tags) {
        tags = JSON.parse(req.body.tags);
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(400).json({
        message: 'Invalid JSON data in form fields',
        error: parseError.message
      });
    }

    const courseData = {
      ...req.body,
      instructor: req.user._id,
      thumbnail: thumbnailUrl,
      cloudinaryPublicId: cloudinaryPublicId,
      whatYouWillLearn: whatYouWillLearn,
      requirements: requirements,
      tags: tags,
      isPublished: req.body.isPublished === 'true' || req.body.isPublished === true,
      publishedAt: req.body.isPublished === 'true' || req.body.isPublished === true ? new Date() : null
    };

    const course = new Course(courseData);
    await course.save();

    // Add course to instructor's created courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdCourses: course._id } }
    );

    // Populate instructor info
    await course.populate('instructor', 'firstName lastName avatar');

    res.status(201).json({
      message: 'Course created successfully',
      course
    });

  } catch (error) {
    console.error('Create course error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      cleanupFiles(req.file);
    }
    
    res.status(500).json({
      message: 'Error creating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update course (instructor only)
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const updateData = req.body;

    // Find course and check ownership
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only update your own courses.'
      });
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName avatar');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      message: 'Error updating course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete course (instructor only)
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find course and check ownership
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own courses.'
      });
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: courseId });
    if (enrollmentCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete course with active enrollments'
      });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ course: courseId });

    // Delete course
    await Course.findByIdAndDelete(courseId);

    // Remove course from instructor's created courses
    await User.findByIdAndUpdate(
      course.instructor,
      { $pull: { createdCourses: courseId } }
    );

    res.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      message: 'Error deleting course',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Publish/unpublish course
const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Check if user is the instructor or admin
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only publish your own courses.'
      });
    }

    // Toggle published status
    course.isPublished = !course.isPublished;
    if (course.isPublished) {
      course.publishedAt = new Date();
    }

    await course.save();

    res.json({
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
      course
    });

  } catch (error) {
    console.error('Toggle publish course error:', error);
    res.status(500).json({
      message: 'Error updating course status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add review to course
const addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      status: 'active'
    });

    if (!enrollment) {
      return res.status(403).json({
        message: 'You must be enrolled in this course to leave a review'
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Add or update review
    course.addReview(userId, rating, comment);
    await course.save();

    // Populate the updated course with reviews
    await course.populate({
      path: 'reviews.user',
      select: 'firstName lastName avatar'
    });

    res.json({
      message: 'Review added successfully',
      course
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      message: 'Error adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get instructor's courses
const getInstructorCourses = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, totalCourses] = await Promise.all([
      Course.find({ instructor: instructorId })
        .populate('lessons', 'title type order')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments({ instructor: instructorId })
    ]);

    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    res.json({
      message: 'Instructor courses retrieved successfully',
      courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCourses,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      message: 'Error retrieving instructor courses',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublishCourse,
  addReview,
  getInstructorCourses
};
