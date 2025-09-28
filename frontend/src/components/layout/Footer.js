import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-heading font-bold">
                EduLearn
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering learners worldwide with high-quality online courses. 
              Learn new skills, advance your career, and achieve your goals with our expert instructors.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/courses" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Browse Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Become a Student
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Become an Instructor
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/courses?category=Programming" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Programming
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses?category=Web Development" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Web Development
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses?category=Data Science" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Data Science
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses?category=Design" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Design
                </Link>
              </li>
              <li>
                <Link 
                  to="/courses?category=Business" 
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail size={16} className="text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">support@edulearn.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={16} className="text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Learning Street,<br />
                  Education City, EC 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} EduLearn. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link 
                to="/privacy" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
