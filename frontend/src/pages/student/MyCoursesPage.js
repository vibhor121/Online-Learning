import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import enrollmentService from '../../services/enrollmentService';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Award, 
  TrendingUp,
  Calendar,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const MyCoursesPage = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    if (user) {
      fetchMyEnrollments();
    }
  }, [user, filter]);

  const fetchMyEnrollments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await enrollmentService.getMyEnrollments(params);
      setEnrollments(response.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast.error('Failed to load your courses');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (enrollment) => {
    if (enrollment.completion?.isCompleted) {
      return <span className="badge badge-success">Completed</span>;
    } else if (enrollment.status === 'active') {
      return <span className="badge badge-primary">In Progress</span>;
    } else {
      return <span className="badge badge-warning">{enrollment.status}</span>;
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-success-600';
    if (percentage >= 50) return 'bg-warning-600';
    return 'bg-primary-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">
                My Courses
              </h1>
              <p className="text-gray-600 mt-2">
                Track your learning progress and continue your education journey
              </p>
            </div>
            
            <Link to="/courses" className="btn-primary">
              <BookOpen size={16} className="mr-2" />
              Browse More Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 max-w-md">
          {[
            { key: 'all', label: 'All Courses' },
            { key: 'active', label: 'In Progress' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.status === 'active' && !e.completion?.isCompleted).length}
                </p>
              </div>
              <PlayCircle className="w-8 h-8 text-warning-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.completion?.isCompleted).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.certificate?.isIssued).length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="card-hover">
                {/* Course Image */}
                <div className="relative">
                  <img
                    src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop'}
                    alt={enrollment.course?.title || 'Course'}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(enrollment)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="badge badge-primary">
                      {enrollment.completion?.completionPercentage || 0}%
                    </span>
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {enrollment.course?.title || 'Course Title'}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    By {enrollment.course?.instructor?.firstName} {enrollment.course?.instructor?.lastName}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{enrollment.completion?.completionPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(enrollment.completion?.completionPercentage || 0)}`}
                        style={{ width: `${enrollment.completion?.completionPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Enrolled {formatDate(enrollment.enrolledAt)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{enrollment.course?.duration || 0}h</span>
                    </div>
                  </div>

                  {/* Time Spent */}
                  {enrollment.progress?.totalTimeSpent > 0 && (
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Time spent: {enrollment.formattedTimeSpent || '0m'}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/course/${enrollment.course?._id}/learn`}
                      className="btn-primary flex-1 text-center"
                    >
                      <Play size={16} className="mr-2" />
                      {enrollment.completion?.isCompleted ? 'Review' : 'Continue'}
                    </Link>
                    
                    {enrollment.certificate?.isIssued && (
                      <Link
                        to={`/certificate/${enrollment.certificate.certificateId}`}
                        className="btn-outline"
                        title="View Certificate"
                      >
                        <Award size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't enrolled in any courses yet. Start your learning journey today!"
                : `No ${filter} courses found. Try a different filter.`
              }
            </p>
            <Link to="/courses" className="btn-primary">
              <BookOpen size={16} className="mr-2" />
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
