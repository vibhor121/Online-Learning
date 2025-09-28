const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { cleanupFiles } = require('../middleware/upload');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'enrollments',
        populate: {
          path: 'course',
          select: 'title thumbnail averageRating'
        }
      })
      .populate('createdCourses', 'title thumbnail enrollmentCount averageRating');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if requesting user can view this profile
    const canViewProfile = req.user._id.toString() === userId || req.user.role === 'admin';
    
    if (!canViewProfile) {
      // Return limited public profile
      const publicProfile = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt
      };

      // Add public course info for instructors
      if (user.role === 'instructor') {
        publicProfile.createdCourses = user.createdCourses;
      }

      return res.json({
        message: 'Public profile retrieved successfully',
        user: publicProfile,
        isPublicView: true
      });
    }

    res.json({
      message: 'User profile retrieved successfully',
      user,
      isPublicView: false
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      message: 'Error retrieving user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update user (admin only or self)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let updateData = req.body;

    // Check permissions
    const canUpdate = req.user._id.toString() === userId || req.user.role === 'admin';
    
    if (!canUpdate) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own profile.'
      });
    }

    // Handle avatar upload if file is provided
    if (req.file) {
      console.log('Uploading user avatar to Cloudinary...');
      const uploadResult = await uploadImage(req.file.path, 'avatars');
      
      // Clean up temporary file
      cleanupFiles(req.file);
      
      if (uploadResult.success) {
        updateData.avatar = uploadResult.url;
        updateData.cloudinaryAvatarId = uploadResult.publicId;
        console.log('✅ User avatar uploaded successfully:', uploadResult.url);
      } else {
        console.error('❌ Cloudinary upload failed:', uploadResult.error);
        return res.status(500).json({
          message: 'Failed to upload avatar',
          error: uploadResult.error
        });
      }
    }

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.role; // Role changes should be handled separately
    delete updateData.isActive; // Status changes should be handled separately
    delete updateData.enrollments;
    delete updateData.createdCourses;

    // If not admin, prevent certain field updates
    if (req.user.role !== 'admin') {
      delete updateData.email; // Email changes should require verification
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      cleanupFiles(req.file);
    }
    
    res.status(500).json({
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        message: 'Cannot delete admin users'
      });
    }

    // Check if user has active enrollments
    const activeEnrollments = await Enrollment.countDocuments({
      student: userId,
      status: 'active'
    });

    if (activeEnrollments > 0) {
      return res.status(400).json({
        message: 'Cannot delete user with active enrollments. Please drop from courses first.'
      });
    }

    // If instructor, check if they have courses with enrollments
    if (user.role === 'instructor') {
      const coursesWithEnrollments = await Course.aggregate([
        { $match: { instructor: user._id } },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'course',
            as: 'enrollments'
          }
        },
        { $match: { 'enrollments.0': { $exists: true } } },
        { $count: 'count' }
      ]);

      if (coursesWithEnrollments.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete instructor with courses that have enrollments'
        });
      }

      // Delete instructor's courses
      await Course.deleteMany({ instructor: userId });
    }

    // Delete user's enrollments
    await Enrollment.deleteMany({ student: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle user active status (admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent deactivating admin users
    if (user.role === 'admin' && user.isActive) {
      return res.status(400).json({
        message: 'Cannot deactivate admin users'
      });
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      message: 'Error updating user status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Change user role (admin only)
const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be student, instructor, or admin.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent changing role of the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot change role of the last active admin'
        });
      }
    }

    // If changing from instructor to student, handle courses
    if (user.role === 'instructor' && role === 'student') {
      const coursesWithEnrollments = await Course.aggregate([
        { $match: { instructor: user._id } },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'course',
            as: 'enrollments'
          }
        },
        { $match: { 'enrollments.0': { $exists: true } } }
      ]);

      if (coursesWithEnrollments.length > 0) {
        return res.status(400).json({
          message: 'Cannot change instructor role while they have courses with enrollments'
        });
      }
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role changed successfully',
      user: user.toPublicJSON()
    });

  } catch (error) {
    console.error('Change user role error:', error);
    res.status(500).json({
      message: 'Error changing user role',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user dashboard stats
const getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'student') {
      // Student dashboard stats
      const [enrollments, completedCourses, totalTimeSpent] = await Promise.all([
        Enrollment.countDocuments({ student: userId, status: 'active' }),
        Enrollment.countDocuments({ student: userId, status: 'completed' }),
        Enrollment.aggregate([
          { $match: { student: userId } },
          { $group: { _id: null, totalTime: { $sum: '$progress.totalTimeSpent' } } }
        ])
      ]);

      // Get recent enrollments with progress
      const recentEnrollments = await Enrollment.find({ student: userId })
        .populate('course', 'title thumbnail')
        .sort({ 'progress.lastAccessedAt': -1 })
        .limit(5);

      stats = {
        enrollments,
        completedCourses,
        totalTimeSpent: totalTimeSpent[0]?.totalTime || 0,
        recentEnrollments
      };

    } else if (userRole === 'instructor') {
      // Instructor dashboard stats
      const [totalCourses, publishedCourses, totalStudents, totalRevenue] = await Promise.all([
        Course.countDocuments({ instructor: userId }),
        Course.countDocuments({ instructor: userId, isPublished: true }),
        Enrollment.aggregate([
          {
            $lookup: {
              from: 'courses',
              localField: 'course',
              foreignField: '_id',
              as: 'courseInfo'
            }
          },
          { $match: { 'courseInfo.instructor': userId, status: 'active' } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ]),
        Enrollment.aggregate([
          {
            $lookup: {
              from: 'courses',
              localField: 'course',
              foreignField: '_id',
              as: 'courseInfo'
            }
          },
          { $match: { 'courseInfo.instructor': userId } },
          { $group: { _id: null, total: { $sum: '$payment.amount' } } }
        ])
      ]);

      // Get recent enrollments in instructor's courses
      const recentEnrollments = await Enrollment.find()
        .populate({
          path: 'course',
          match: { instructor: userId },
          select: 'title'
        })
        .populate('student', 'firstName lastName')
        .sort({ enrolledAt: -1 })
        .limit(10);

      const validEnrollments = recentEnrollments.filter(enrollment => enrollment.course);

      stats = {
        totalCourses,
        publishedCourses,
        totalStudents: totalStudents[0]?.count || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentEnrollments: validEnrollments
      };

    } else if (userRole === 'admin') {
      // Admin dashboard stats
      const [totalUsers, totalCourses, totalEnrollments, totalRevenue] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Course.countDocuments({ isPublished: true }),
        Enrollment.countDocuments({ status: 'active' }),
        Enrollment.aggregate([
          { $group: { _id: null, total: { $sum: '$payment.amount' } } }
        ])
      ]);

      // Get recent registrations
      const recentUsers = await User.find({ isActive: true })
        .select('firstName lastName email role createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

      stats = {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentUsers
      };
    }

    res.json({
      message: 'Dashboard stats retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get user dashboard stats error:', error);
    res.status(500).json({
      message: 'Error retrieving dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  getUserDashboardStats
};



