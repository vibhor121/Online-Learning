import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  Play,
  CheckCircle,
  Globe,
  Award,
  User,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      if (user) {
        checkEnrollmentStatus();
      }
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourseById(courseId);
      setCourse(response.course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const enrolled = await enrollmentService.isEnrolledInCourse(courseId);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in this course');
      return;
    }
    
    try {
      setEnrolling(true);
      await enrollmentService.enrollInCourse(courseId);
      toast.success('Successfully enrolled in course!');
      setIsEnrolled(true);
      
      // Update course enrollment count
      setCourse(prev => ({
        ...prev,
        enrollmentCount: (prev.enrollmentCount || 0) + 1
      }));
    } catch (error) {
      console.error('Enrollment error:', error);
      if (error.response?.status === 400) {
        toast.error('You are already enrolled in this course');
        setIsEnrolled(true);
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading course details..." />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/courses" className="btn-primary">
            <ArrowLeft size={16} className="mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-700 text-white">
        <div className="container py-12">
          <div className="flex items-center mb-6">
            <Link to="/courses" className="text-primary-200 hover:text-white mr-4">
              <ArrowLeft size={20} />
            </Link>
            <nav className="text-primary-200 text-sm">
              <Link to="/courses" className="hover:text-white">Courses</Link>
              <span className="mx-2">/</span>
              <span>{course.category}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="badge bg-primary-500 text-white">
                  {course.category}
                </span>
                <span className="badge bg-white text-primary-600 ml-2">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl font-heading font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-xl text-primary-100 mb-6">
                {course.shortDescription}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center">
                  {renderStars(course.averageRating || 0)}
                  <span className="ml-2 text-primary-100">
                    {course.averageRating?.toFixed(1) || '0.0'} ({course.totalRatings || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center text-primary-100">
                  <Users size={16} className="mr-2" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>

                <div className="flex items-center text-primary-100">
                  <Clock size={16} className="mr-2" />
                  <span>{course.duration || 0} hours</span>
                </div>

                <div className="flex items-center text-primary-100">
                  <Globe size={16} className="mr-2" />
                  <span>{course.language || 'English'}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mr-4">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-primary-100">Created by</p>
                  <p className="text-white font-semibold">
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-4">
                <div className="relative mb-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price > 0 && (
                    <p className="text-sm text-gray-600">One-time payment</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {user?.role === 'student' && (
                    <>
                      {isEnrolled ? (
                        <Link
                          to={`/course/${course._id}/learn`}
                          className="btn-primary w-full text-center"
                        >
                          <Play size={16} className="mr-2" />
                          Continue Learning
                        </Link>
                      ) : (
                        <button
                          onClick={handleEnroll}
                          disabled={enrolling}
                          className="btn-primary w-full"
                        >
                          {enrolling ? (
                            <LoadingSpinner size="sm" color="white" />
                          ) : (
                            <>
                              <BookOpen size={16} className="mr-2" />
                              Enroll Now
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}

                  <button className="btn-outline w-full">
                    <Heart size={16} className="mr-2" />
                    Add to Wishlist
                  </button>

                  <button className="btn-outline w-full">
                    <Share2 size={16} className="mr-2" />
                    Share Course
                  </button>
                </div>

                {/* Course Includes */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <Clock size={14} className="mr-2 text-primary-600" />
                      {course.duration || 0} hours on-demand video
                    </li>
                    <li className="flex items-center">
                      <Award size={14} className="mr-2 text-primary-600" />
                      Certificate of completion
                    </li>
                    <li className="flex items-center">
                      <Globe size={14} className="mr-2 text-primary-600" />
                      Full lifetime access
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'curriculum', label: 'Curriculum' },
                  { key: 'instructor', label: 'Instructor' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* About Course */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About this course</h3>
                    <div className="prose max-w-none text-gray-700">
                      <p>{course.description}</p>
                    </div>
                  </div>

                  {/* What You'll Learn */}
                  {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">What you'll learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle size={16} className="text-success-600 mr-3 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                            {requirement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Curriculum</h3>
                  {course.lessons && course.lessons.length > 0 ? (
                    <div className="space-y-4">
                      {course.lessons.map((lesson, index) => (
                        <div key={lesson._id || index} className="border border-gray-200 rounded-lg">
                          <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{lesson.title || `Lesson ${index + 1}`}</h4>
                                <p className="text-sm text-gray-600">{lesson.description || 'Course content'}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Play size={14} className="mr-1" />
                              <span>5 min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Course curriculum is being prepared</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">About the instructor</h3>
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={32} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </h4>
                      <p className="text-gray-600 mt-2">
                        {course.instructor?.bio || 'Experienced instructor passionate about sharing knowledge and helping students succeed.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Course Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="card p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <span key={index} className="badge badge-outline">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Info */}
              <div className="card p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Course Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="text-gray-900">{course.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="text-gray-900">{course.duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lessons</span>
                    <span className="text-gray-900">{course.lessonCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language</span>
                    <span className="text-gray-900">{course.language || 'English'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published</span>
                    <span className="text-gray-900">
                      {new Date(course.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;