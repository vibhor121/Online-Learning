import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import enrollmentService from '../../services/enrollmentService';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock,
  Award,
  Play,
  Plus,
  ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentCourses: [],
    recentActivity: []
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'student') {
        // Fetch student dashboard data
        const [enrollmentsResponse, coursesResponse] = await Promise.all([
          enrollmentService.getMyEnrollments(),
          courseService.getCourses({ limit: 3 })
        ]);

        const enrollments = enrollmentsResponse.enrollments || [];
        const completedCount = enrollments.filter(e => e.completionPercentage === 100).length;
        const totalHours = enrollments.reduce((sum, e) => sum + (e.course?.duration || 0), 0);

        setDashboardData({
          stats: {
            enrolledCourses: enrollments.length,
            completedCourses: completedCount,
            totalHours: Math.round(totalHours),
            certificates: completedCount
          },
          recentCourses: enrollments.slice(0, 3).map(enrollment => ({
            id: enrollment.course._id,
            title: enrollment.course.title,
            progress: enrollment.completionPercentage || 0,
            thumbnail: enrollment.course.thumbnail,
            instructor: `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`,
            nextLesson: 'Continue Learning'
          })),
          recentActivity: [
            {
              type: 'enrollment',
              message: `Enrolled in "${enrollments[0]?.course?.title || 'a course'}"`,
              time: '2 hours ago'
            }
          ]
        });

      } else if (user.role === 'instructor') {
        // Fetch instructor dashboard data
        const coursesResponse = await courseService.getMyCourses();
        const courses = coursesResponse.courses || [];
        
        const totalStudents = courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
        const totalRevenue = courses.reduce((sum, course) => sum + (course.price * (course.enrollmentCount || 0)), 0);
        const avgRating = courses.length > 0 
          ? courses.reduce((sum, course) => sum + (course.averageRating || 0), 0) / courses.length 
          : 0;

        setDashboardData({
          stats: {
            totalCourses: courses.length,
            totalStudents,
            totalRevenue: Math.round(totalRevenue),
            avgRating: Math.round(avgRating * 10) / 10
          },
          recentCourses: courses.slice(0, 3).map(course => ({
            id: course._id,
            title: course.title,
            thumbnail: course.thumbnail,
            instructor: `${user.firstName} ${user.lastName}`,
            enrollmentCount: course.enrollmentCount || 0
          })),
          recentActivity: [
            {
              type: 'course',
              message: `Course "${courses[0]?.title || 'New Course'}" published`,
              time: '1 day ago'
            }
          ]
        });

      } else {
        // Admin dashboard
        const coursesResponse = await courseService.getCourses({ limit: 10 });
        const courses = coursesResponse.courses || [];

        setDashboardData({
          stats: {
            totalUsers: 2543,
            totalCourses: courses.length,
            activeEnrollments: courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0),
            certificatesIssued: 1245
          },
          recentCourses: courses.slice(0, 3),
          recentActivity: [
            {
              type: 'system',
              message: 'System maintenance completed',
              time: '3 hours ago'
            }
          ]
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to sample data
      setDashboardData({
        stats: user.role === 'student' 
          ? { enrolledCourses: 0, completedCourses: 0, totalHours: 0, certificates: 0 }
          : user.role === 'instructor'
          ? { totalCourses: 0, totalStudents: 0, totalRevenue: 0, avgRating: 0 }
          : { totalUsers: 0, totalCourses: 0, activeEnrollments: 0, certificatesIssued: 0 },
        recentCourses: [],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'primary' }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
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
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'student' 
                  ? 'Continue your learning journey'
                  : user?.role === 'instructor'
                  ? 'Manage your courses and students'
                  : 'System overview and management'
                }
              </p>
            </div>
            
            {user?.role === 'instructor' && (
              <Link to="/instructor/courses/create" className="btn-primary">
                <Plus size={16} className="mr-2" />
                Create Course
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'student' ? (
            <>
              <StatCard
                icon={BookOpen}
                title="Enrolled Courses"
                value={dashboardData.stats.enrolledCourses || 0}
                color="primary"
              />
              <StatCard
                icon={Award}
                title="Completed"
                value={dashboardData.stats.completedCourses || 0}
                color="success"
              />
              <StatCard
                icon={Clock}
                title="Learning Hours"
                value={`${dashboardData.stats.totalHours || 0}h`}
                color="warning"
              />
              <StatCard
                icon={Award}
                title="Certificates"
                value={dashboardData.stats.certificates || 0}
                color="purple"
              />
            </>
          ) : user?.role === 'instructor' ? (
            <>
              <StatCard
                icon={BookOpen}
                title="Total Courses"
                value={dashboardData.stats.totalCourses || 0}
                color="primary"
              />
              <StatCard
                icon={Users}
                title="Total Students"
                value={dashboardData.stats.totalStudents || 0}
                color="success"
              />
              <StatCard
                icon={TrendingUp}
                title="Revenue"
                value={`$${dashboardData.stats.totalRevenue || 0}`}
                color="warning"
              />
              <StatCard
                icon={Award}
                title="Avg Rating"
                value={dashboardData.stats.avgRating || 0}
                subtitle={dashboardData.stats.avgRating ? "⭐⭐⭐⭐⭐" : "No ratings yet"}
                color="purple"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={Users}
                title="Total Users"
                value={dashboardData.stats.totalUsers || 0}
                color="primary"
              />
              <StatCard
                icon={BookOpen}
                title="Total Courses"
                value={dashboardData.stats.totalCourses || 0}
                color="success"
              />
              <StatCard
                icon={TrendingUp}
                title="Active Enrollments"
                value={dashboardData.stats.activeEnrollments || 0}
                color="warning"
              />
              <StatCard
                icon={Award}
                title="Certificates Issued"
                value={dashboardData.stats.certificatesIssued || 0}
                color="purple"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent/My Courses */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.role === 'student' ? 'Continue Learning' : 'Recent Courses'}
              </h2>
              <Link 
                to={user?.role === 'student' ? '/my-courses' : '/instructor/courses'}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.recentCourses.length > 0 ? dashboardData.recentCourses.map(course => (
                <div key={course.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-16 h-10 object-cover rounded"
                  />
                  
                  <div className="ml-4 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      by {course.instructor}
                    </p>
                    
                    {user?.role === 'student' && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {course.progress}% complete • Next: {course.nextLesson}
                        </p>
                      </>
                    )}
                  </div>

                  <button className="btn-primary btn-sm ml-4">
                    <Play size={12} className="mr-1" />
                    {user?.role === 'student' ? 'Continue' : 'View'}
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No courses yet</p>
                  {user?.role === 'student' && (
                    <Link to="/courses" className="btn-primary mt-3 inline-block">
                      Browse Courses
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {user?.role === 'student' ? (
                <>
                  <Link to="/courses" className="btn-outline text-left p-4">
                    <BookOpen className="w-5 h-5 mr-3 inline" />
                    Browse New Courses
                  </Link>
                  <Link to="/my-courses" className="btn-outline text-left p-4">
                    <Play className="w-5 h-5 mr-3 inline" />
                    Continue Learning
                  </Link>
                  <Link to="/profile" className="btn-outline text-left p-4">
                    <Users className="w-5 h-5 mr-3 inline" />
                    Update Profile
                  </Link>
                </>
              ) : user?.role === 'instructor' ? (
                <>
                  <Link to="/instructor/courses/create" className="btn-outline text-left p-4">
                    <Plus className="w-5 h-5 mr-3 inline" />
                    Create New Course
                  </Link>
                  <Link to="/instructor/courses" className="btn-outline text-left p-4">
                    <BookOpen className="w-5 h-5 mr-3 inline" />
                    Manage Courses
                  </Link>
                  <Link to="/instructor/dashboard" className="btn-outline text-left p-4">
                    <TrendingUp className="w-5 h-5 mr-3 inline" />
                    View Analytics
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin/users" className="btn-outline text-left p-4">
                    <Users className="w-5 h-5 mr-3 inline" />
                    Manage Users
                  </Link>
                  <Link to="/admin/dashboard" className="btn-outline text-left p-4">
                    <TrendingUp className="w-5 h-5 mr-3 inline" />
                    System Analytics
                  </Link>
                  <Link to="/courses" className="btn-outline text-left p-4">
                    <BookOpen className="w-5 h-5 mr-3 inline" />
                    Review Courses
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                <p className="text-sm text-gray-700">
                  Completed lesson "Introduction to React" in Web Development course
                </p>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-success-600 rounded-full mr-3"></div>
                <p className="text-sm text-gray-700">
                  Enrolled in "Python for Data Science" course
                </p>
                <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-warning-600 rounded-full mr-3"></div>
                <p className="text-sm text-gray-700">
                  Earned certificate for "HTML & CSS Basics"
                </p>
                <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
