import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Users, 
  Star, 
  Clock,
  BookOpen,
  MoreVertical
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageCoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getInstructorCourses();
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      setActionLoading(courseId);
      await courseService.togglePublishCourse(courseId);
      
      // Update local state
      setCourses(prevCourses =>
        prevCourses.map(course =>
          course._id === courseId
            ? { ...course, isPublished: !currentStatus, publishedAt: !currentStatus ? new Date() : course.publishedAt }
            : course
        )
      );
      
      toast.success(`Course ${!currentStatus ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Toggle publish error:', error);
      toast.error('Failed to update course status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(courseId);
      await courseService.deleteCourse(courseId);
      
      // Remove from local state
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
      
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Delete course error:', error);
      if (error.response?.status === 400) {
        toast.error('Cannot delete course with active enrollments');
      } else {
        toast.error('Failed to delete course');
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your courses..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-2">
                Manage Courses
              </h1>
              <p className="text-lg text-gray-600">
                Create, edit, and manage your courses
              </p>
            </div>
            <Link to="/instructor/courses/create" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Create New Course
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first course to start teaching students
            </p>
            <Link to="/instructor/courses/create" className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="card-hover">
                {/* Course Image */}
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`badge ${
                      course.isPublished ? 'badge-success' : 'badge-warning'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-primary">
                      ${course.price}
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-sm text-primary-600 font-medium">
                      {course.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.shortDescription}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{course.averageRating || 0}</span>
                      <span className="ml-1">({course.totalRatings || 0})</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.enrollmentCount || 0}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration || 0}h</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-outline flex-1 text-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    
                    <Link
                      to={`/instructor/courses/${course._id}/edit`}
                      className="btn-outline flex-1 text-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      disabled={actionLoading === course._id}
                      className={`btn-outline ${
                        course.isPublished ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
                      }`}
                      title={course.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {actionLoading === course._id ? (
                        <LoadingSpinner size="sm" />
                      ) : course.isPublished ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCourse(course._id, course.title)}
                      disabled={actionLoading === course._id}
                      className="btn-outline text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      {actionLoading === course._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoursesPage;

