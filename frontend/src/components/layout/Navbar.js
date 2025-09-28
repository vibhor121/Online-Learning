import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home,
  GraduationCap,
  Settings,
  Users,
  PlusCircle
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const NavLink = ({ to, children, onClick }) => (
    <Link
      to={to}
      onClick={onClick || closeMenus}
      className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ to, children, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick || closeMenus}
      className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
    >
      <Icon size={20} />
      <span>{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-heading font-bold text-gray-900">
              EduLearn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/courses">Courses</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NavLink to="/dashboard">Dashboard</NavLink>
                
                {user?.role === 'instructor' && (
                  <NavLink to="/instructor/courses">My Courses</NavLink>
                )}
                
                {user?.role === 'admin' && (
                  <NavLink to="/admin/dashboard">Admin</NavLink>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-1"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-primary-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      {user?.firstName}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/my-courses"
                        onClick={closeMenus}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <BookOpen size={16} />
                        <span>My Courses</span>
                      </Link>

                      {user?.role === 'instructor' && (
                        <Link
                          to="/instructor/courses/create"
                          onClick={closeMenus}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <PlusCircle size={16} />
                          <span>Create Course</span>
                        </Link>
                      )}

                      <hr className="my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <NavLink to="/login">Sign in</NavLink>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-2 rounded-md"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-100">
              <MobileNavLink to="/" icon={Home}>Home</MobileNavLink>
              <MobileNavLink to="/courses" icon={BookOpen}>Courses</MobileNavLink>
              <MobileNavLink to="/about" icon={User}>About</MobileNavLink>
              <MobileNavLink to="/contact" icon={Settings}>Contact</MobileNavLink>

              {isAuthenticated ? (
                <>
                  <hr className="my-2" />
                  <MobileNavLink to="/dashboard" icon={Home}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/profile" icon={User}>Profile</MobileNavLink>
                  <MobileNavLink to="/my-courses" icon={BookOpen}>My Courses</MobileNavLink>
                  
                  {user?.role === 'instructor' && (
                    <>
                      <MobileNavLink to="/instructor/courses" icon={BookOpen}>
                        Manage Courses
                      </MobileNavLink>
                      <MobileNavLink to="/instructor/courses/create" icon={PlusCircle}>
                        Create Course
                      </MobileNavLink>
                    </>
                  )}
                  
                  {user?.role === 'admin' && (
                    <MobileNavLink to="/admin/dashboard" icon={Users}>
                      Admin Panel
                    </MobileNavLink>
                  )}
                  
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full text-left"
                  >
                    <LogOut size={20} />
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-2" />
                  <MobileNavLink to="/login" icon={User}>Sign in</MobileNavLink>
                  <MobileNavLink to="/signup" icon={PlusCircle}>Sign up</MobileNavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

