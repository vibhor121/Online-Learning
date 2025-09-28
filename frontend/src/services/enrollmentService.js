import api from './api';

const ENROLLMENT_ENDPOINTS = {
  ENROLL: (courseId) => `/enrollments/course/${courseId}`,
  MY_ENROLLMENTS: '/enrollments/my-enrollments',
  ENROLLMENT_STATS: '/enrollments/stats',
  ENROLLMENT_BY_ID: (id) => `/enrollments/${id}`,
  UPDATE_PROGRESS: (id) => `/enrollments/${id}/progress`,
  DROP_COURSE: (id) => `/enrollments/${id}/drop`,
  ADD_NOTE: (id) => `/enrollments/${id}/notes`,
  COURSE_ENROLLMENTS: (courseId) => `/enrollments/course/${courseId}/enrollments`,
};

export const enrollmentService = {
  // Enroll in a course
  enrollInCourse: async (courseId) => {
    const response = await api.post(ENROLLMENT_ENDPOINTS.ENROLL(courseId));
    return response.data;
  },

  // Get user's enrollments
  getUserEnrollments: async (params = {}) => {
    const response = await api.get(ENROLLMENT_ENDPOINTS.MY_ENROLLMENTS, { params });
    return response.data;
  },

  // Get enrollment statistics
  getEnrollmentStats: async () => {
    const response = await api.get(ENROLLMENT_ENDPOINTS.ENROLLMENT_STATS);
    return response.data;
  },

  // Get specific enrollment details
  getEnrollmentDetails: async (enrollmentId) => {
    const response = await api.get(ENROLLMENT_ENDPOINTS.ENROLLMENT_BY_ID(enrollmentId));
    return response.data;
  },

  // Update learning progress
  updateProgress: async (enrollmentId, progressData) => {
    const response = await api.put(ENROLLMENT_ENDPOINTS.UPDATE_PROGRESS(enrollmentId), progressData);
    return response.data;
  },

  // Drop from course
  dropFromCourse: async (enrollmentId) => {
    const response = await api.patch(ENROLLMENT_ENDPOINTS.DROP_COURSE(enrollmentId));
    return response.data;
  },

  // Add note to enrollment
  addEnrollmentNote: async (enrollmentId, noteData) => {
    const response = await api.post(ENROLLMENT_ENDPOINTS.ADD_NOTE(enrollmentId), noteData);
    return response.data;
  },

  // Get course enrollments (for instructors)
  getCourseEnrollments: async (courseId, params = {}) => {
    const response = await api.get(ENROLLMENT_ENDPOINTS.COURSE_ENROLLMENTS(courseId), { params });
    return response.data;
  },

  // Get active enrollments
  getActiveEnrollments: async () => {
    const response = await api.get(ENROLLMENT_ENDPOINTS.MY_ENROLLMENTS, {
      params: { status: 'active' }
    });
    return response.data;
  },

  // Get completed enrollments
  getCompletedEnrollments: async () => {
    const response = await api.get(ENROLLMENT_ENDPOINTS.MY_ENROLLMENTS, {
      params: { status: 'completed' }
    });
    return response.data;
  },

  // Check if user is enrolled in a course
  isEnrolledInCourse: async (courseId) => {
    try {
      const enrollments = await enrollmentService.getUserEnrollments({
        status: 'active',
        limit: 100
      });
      
      return enrollments.enrollments.some(
        enrollment => enrollment.course._id === courseId
      );
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      return false;
    }
  },

  // Get enrollment by course ID
  getEnrollmentByCourse: async (courseId) => {
    try {
      const enrollments = await enrollmentService.getUserEnrollments({
        status: 'active',
        limit: 100
      });
      
      return enrollments.enrollments.find(
        enrollment => enrollment.course._id === courseId
      );
    } catch (error) {
      console.error('Error getting enrollment by course:', error);
      return null;
    }
  },

  // Alternative method names for compatibility
  getMyEnrollments: async (params = {}) => {
    return enrollmentService.getUserEnrollments(params);
  },
};

export default enrollmentService;
