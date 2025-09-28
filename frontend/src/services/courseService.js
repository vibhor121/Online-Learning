import api from './api';

const COURSE_ENDPOINTS = {
  COURSES: '/courses',
  COURSE_BY_ID: (id) => `/courses/${id}`,
  INSTRUCTOR_COURSES: '/courses/instructor/my-courses',
  COURSE_REVIEW: (id) => `/courses/${id}/review`,
  TOGGLE_PUBLISH: (id) => `/courses/${id}/publish`,
};

export const courseService = {
  // Get all courses with filters and pagination
  getCourses: async (params = {}) => {
    const response = await api.get(COURSE_ENDPOINTS.COURSES, { params });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    const response = await api.get(COURSE_ENDPOINTS.COURSE_BY_ID(courseId));
    return response.data;
  },

  // Create new course (instructor only)
  createCourse: async (courseData) => {
    const response = await api.post(COURSE_ENDPOINTS.COURSES, courseData);
    return response.data;
  },

  // Update course (instructor only)
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(COURSE_ENDPOINTS.COURSE_BY_ID(courseId), courseData);
    return response.data;
  },

  // Delete course (instructor only)
  deleteCourse: async (courseId) => {
    const response = await api.delete(COURSE_ENDPOINTS.COURSE_BY_ID(courseId));
    return response.data;
  },

  // Get instructor's courses
  getInstructorCourses: async (params = {}) => {
    const response = await api.get(COURSE_ENDPOINTS.INSTRUCTOR_COURSES, { params });
    return response.data;
  },

  // Toggle course publish status
  togglePublishCourse: async (courseId) => {
    const response = await api.patch(COURSE_ENDPOINTS.TOGGLE_PUBLISH(courseId));
    return response.data;
  },

  // Add review to course
  addReview: async (courseId, reviewData) => {
    const response = await api.post(COURSE_ENDPOINTS.COURSE_REVIEW(courseId), reviewData);
    return response.data;
  },

  // Search courses
  searchCourses: async (query, filters = {}) => {
    const params = { search: query, ...filters };
    const response = await api.get(COURSE_ENDPOINTS.COURSES, { params });
    return response.data;
  },

  // Get courses by category
  getCoursesByCategory: async (category, params = {}) => {
    const response = await api.get(COURSE_ENDPOINTS.COURSES, {
      params: { category, ...params }
    });
    return response.data;
  },

  // Get featured courses
  getFeaturedCourses: async (limit = 8) => {
    const response = await api.get(COURSE_ENDPOINTS.COURSES, {
      params: {
        sortBy: 'averageRating',
        sortOrder: 'desc',
        limit
      }
    });
    return response.data;
  },

  // Get popular courses
  getPopularCourses: async (limit = 8) => {
    const response = await api.get(COURSE_ENDPOINTS.COURSES, {
      params: {
        sortBy: 'enrollmentCount',
        sortOrder: 'desc',
        limit
      }
    });
    return response.data;
  },

  // Get recent courses
  getRecentCourses: async (limit = 8) => {
    const response = await api.get(COURSE_ENDPOINTS.COURSES, {
      params: {
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit
      }
    });
    return response.data;
  },
};

export default courseService;



