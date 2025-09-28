import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  ChevronDown 
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const categories = [
    'Programming', 'Web Development', 'Mobile Development', 
    'Data Science', 'Machine Learning', 'Design', 'Business', 
    'Marketing', 'Photography', 'Music', 'Language', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  // Fetch courses from database
  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;

      const response = await courseService.getCourses(params);
      setCourses(response.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      toast.error('Please login to enroll in courses');
      return;
    }
    
    try {
      setEnrolling(courseId);
      await enrollmentService.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      
      // Update course enrollment count
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId 
            ? { ...course, enrollmentCount: course.enrollmentCount + 1 }
            : course
        )
      );
    } catch (error) {
      console.error('Enrollment error:', error);
      if (error.response?.status === 400) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading courses..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container py-8">
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
            Explore Courses
          </h1>
          <p className="text-lg text-gray-600">
            Discover thousands of courses from expert instructors
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="card p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="form-label">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="form-label">Category</label>
                <select
                  className="input"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="form-label">Level</label>
                <select
                  className="input"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <option value="">All Levels</option>
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedLevel('');
                }}
                className="btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {courses.length} course{courses.length !== 1 ? 's' : ''} found
              </p>
              
              {user?.role === 'instructor' && (
                <Link to="/instructor/courses/create" className="btn-primary">
                  Create Course
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                        course.level === 'Beginner' ? 'badge-success' :
                        course.level === 'Intermediate' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {course.level}
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

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span className="mr-4">
                        By {course.instructor.firstName} {course.instructor.lastName}
                      </span>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{course.averageRating}</span>
                        <span className="ml-1">({course.totalRatings})</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{course.enrollmentCount}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{course.duration}h</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/courses/${course._id}`}
                        className={`btn-outline text-center ${user?.role === 'student' ? 'flex-1' : 'w-full'}`}
                      >
                        View Details
                      </Link>
                      
                      {user?.role === 'student' && (
                        <button
                          onClick={() => handleEnroll(course._id)}
                          disabled={enrolling === course._id}
                          className="btn-primary flex-1"
                        >
                          {enrolling === course._id ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            'Enroll Now'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {courses.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No courses found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse all courses.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;