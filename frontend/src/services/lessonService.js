import api from './api';

const LESSON_ENDPOINTS = {
  COURSE_LESSONS: (courseId) => `/lessons/course/${courseId}`,
  LESSON_BY_ID: (id) => `/lessons/${id}`,
  CREATE_LESSON: (courseId) => `/lessons/course/${courseId}`,
  COMPLETE_LESSON: (id) => `/lessons/${id}/complete`,
  LESSON_NOTES: (id) => `/lessons/${id}/notes`,
  TOGGLE_PUBLISH: (id) => `/lessons/${id}/publish`,
};

export const lessonService = {
  // Get all lessons for a course
  getCourseLessons: async (courseId) => {
    const response = await api.get(LESSON_ENDPOINTS.COURSE_LESSONS(courseId));
    return response.data;
  },

  // Get lesson by ID
  getLessonById: async (lessonId) => {
    const response = await api.get(LESSON_ENDPOINTS.LESSON_BY_ID(lessonId));
    return response.data;
  },

  // Create new lesson (instructor only)
  createLesson: async (courseId, lessonData) => {
    const response = await api.post(LESSON_ENDPOINTS.CREATE_LESSON(courseId), lessonData);
    return response.data;
  },

  // Update lesson (instructor only)
  updateLesson: async (lessonId, lessonData) => {
    const response = await api.put(LESSON_ENDPOINTS.LESSON_BY_ID(lessonId), lessonData);
    return response.data;
  },

  // Delete lesson (instructor only)
  deleteLesson: async (lessonId) => {
    const response = await api.delete(LESSON_ENDPOINTS.LESSON_BY_ID(lessonId));
    return response.data;
  },

  // Mark lesson as completed
  markLessonCompleted: async (lessonId, completionData = {}) => {
    const response = await api.post(LESSON_ENDPOINTS.COMPLETE_LESSON(lessonId), completionData);
    return response.data;
  },

  // Add note to lesson
  addLessonNote: async (lessonId, noteData) => {
    const response = await api.post(LESSON_ENDPOINTS.LESSON_NOTES(lessonId), noteData);
    return response.data;
  },

  // Get lesson notes
  getLessonNotes: async (lessonId) => {
    const response = await api.get(LESSON_ENDPOINTS.LESSON_NOTES(lessonId));
    return response.data;
  },

  // Toggle lesson publish status
  togglePublishLesson: async (lessonId) => {
    const response = await api.patch(LESSON_ENDPOINTS.TOGGLE_PUBLISH(lessonId));
    return response.data;
  },

  // Get lesson progress for user
  getLessonProgress: async (lessonId, enrollmentId) => {
    try {
      // This would typically be part of enrollment data
      // For now, we'll check if lesson is completed via lesson details
      const lessonData = await lessonService.getLessonById(lessonId);
      return {
        isCompleted: lessonData.lesson.isCompleted || false,
        completedAt: lessonData.lesson.completedAt || null,
        score: lessonData.lesson.userScore || null,
      };
    } catch (error) {
      console.error('Error getting lesson progress:', error);
      return {
        isCompleted: false,
        completedAt: null,
        score: null,
      };
    }
  },

  // Get next lesson in course
  getNextLesson: async (courseId, currentLessonOrder) => {
    try {
      const courseLessons = await lessonService.getCourseLessons(courseId);
      const sortedLessons = courseLessons.lessons.sort((a, b) => a.order - b.order);
      
      const currentIndex = sortedLessons.findIndex(lesson => lesson.order === currentLessonOrder);
      
      if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
        return sortedLessons[currentIndex + 1];
      }
      
      return null; // No next lesson
    } catch (error) {
      console.error('Error getting next lesson:', error);
      return null;
    }
  },

  // Get previous lesson in course
  getPreviousLesson: async (courseId, currentLessonOrder) => {
    try {
      const courseLessons = await lessonService.getCourseLessons(courseId);
      const sortedLessons = courseLessons.lessons.sort((a, b) => a.order - b.order);
      
      const currentIndex = sortedLessons.findIndex(lesson => lesson.order === currentLessonOrder);
      
      if (currentIndex > 0) {
        return sortedLessons[currentIndex - 1];
      }
      
      return null; // No previous lesson
    } catch (error) {
      console.error('Error getting previous lesson:', error);
      return null;
    }
  },

  // Calculate course progress
  calculateCourseProgress: async (courseId) => {
    try {
      const courseLessons = await lessonService.getCourseLessons(courseId);
      const { lessons } = courseLessons;
      
      if (lessons.length === 0) {
        return { completionPercentage: 0, completedLessons: 0, totalLessons: 0 };
      }
      
      const completedLessons = lessons.filter(lesson => lesson.isCompleted).length;
      const completionPercentage = Math.round((completedLessons / lessons.length) * 100);
      
      return {
        completionPercentage,
        completedLessons,
        totalLessons: lessons.length
      };
    } catch (error) {
      console.error('Error calculating course progress:', error);
      return { completionPercentage: 0, completedLessons: 0, totalLessons: 0 };
    }
  },
};

export default lessonService;



