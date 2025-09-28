import api from './api';

const USER_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
  USER_PROFILE: (id) => `/users/${id}/profile`,
  DASHBOARD_STATS: '/users/dashboard/stats',
  TOGGLE_STATUS: (id) => `/users/${id}/status`,
  CHANGE_ROLE: (id) => `/users/${id}/role`,
};

export const userService = {
  // Get all users (admin only)
  getUsers: async (params = {}) => {
    const response = await api.get(USER_ENDPOINTS.USERS, { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(USER_ENDPOINTS.USER_BY_ID(userId));
    return response.data;
  },

  // Get user profile (public view)
  getUserProfile: async (userId) => {
    const response = await api.get(USER_ENDPOINTS.USER_PROFILE(userId));
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await api.put(USER_ENDPOINTS.USER_BY_ID(userId), userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(USER_ENDPOINTS.USER_BY_ID(userId));
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get(USER_ENDPOINTS.DASHBOARD_STATS);
    return response.data;
  },

  // Toggle user active status (admin only)
  toggleUserStatus: async (userId) => {
    const response = await api.patch(USER_ENDPOINTS.TOGGLE_STATUS(userId));
    return response.data;
  },

  // Change user role (admin only)
  changeUserRole: async (userId, role) => {
    const response = await api.patch(USER_ENDPOINTS.CHANGE_ROLE(userId), { role });
    return response.data;
  },

  // Search users
  searchUsers: async (query, filters = {}) => {
    const params = { search: query, ...filters };
    const response = await api.get(USER_ENDPOINTS.USERS, { params });
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (role, params = {}) => {
    const response = await api.get(USER_ENDPOINTS.USERS, {
      params: { role, ...params }
    });
    return response.data;
  },

  // Get instructors
  getInstructors: async (params = {}) => {
    return userService.getUsersByRole('instructor', params);
  },

  // Get students
  getStudents: async (params = {}) => {
    return userService.getUsersByRole('student', params);
  },

  // Get admins
  getAdmins: async (params = {}) => {
    return userService.getUsersByRole('admin', params);
  },

  // Get user statistics
  getUserStats: async (userId) => {
    try {
      const user = await userService.getUserById(userId);
      
      // Calculate basic stats from user data
      const stats = {
        totalCourses: user.user.createdCourses?.length || 0,
        totalEnrollments: user.user.enrollments?.length || 0,
        joinDate: user.user.createdAt,
        lastLogin: user.user.lastLogin,
        role: user.user.role,
        isActive: user.user.isActive,
      };
      
      return { stats };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { stats: {} };
    }
  },

  // Update user avatar
  updateUserAvatar: async (userId, avatarData) => {
    const response = await api.put(USER_ENDPOINTS.USER_BY_ID(userId), {
      avatar: avatarData
    });
    return response.data;
  },

  // Bulk operations (admin only)
  bulkUpdateUsers: async (userIds, updateData) => {
    const promises = userIds.map(id => 
      userService.updateUser(id, updateData)
    );
    
    const results = await Promise.allSettled(promises);
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  },

  // Bulk delete users (admin only)
  bulkDeleteUsers: async (userIds) => {
    const promises = userIds.map(id => 
      userService.deleteUser(id)
    );
    
    const results = await Promise.allSettled(promises);
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  },
};

export default userService;

