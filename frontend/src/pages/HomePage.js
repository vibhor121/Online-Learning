import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  Play,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const HomePage = () => {
  const stats = [
    { label: 'Active Students', value: '10,000+', icon: Users },
    { label: 'Expert Instructors', value: '500+', icon: Award },
    { label: 'Online Courses', value: '1,200+', icon: BookOpen },
    { label: 'Success Rate', value: '95%', icon: TrendingUp },
  ];

  const features = [
    {
      title: 'Expert Instructors',
      description: 'Learn from industry professionals with years of experience',
      icon: Award,
    },
    {
      title: 'Flexible Learning',
      description: 'Study at your own pace, anywhere and anytime',
      icon: BookOpen,
    },
    {
      title: 'Interactive Content',
      description: 'Engage with quizzes, assignments, and hands-on projects',
      icon: Play,
    },
    {
      title: 'Certification',
      description: 'Earn certificates to showcase your achievements',
      icon: CheckCircle,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Developer',
      content: 'EduLearn helped me transition into tech. The courses are comprehensive and the instructors are amazing!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Michael Chen',
      role: 'Digital Marketer',
      content: 'The flexibility of online learning allowed me to upskill while working full-time. Highly recommended!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      content: 'The practical projects and real-world examples made learning engaging and applicable to my career.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 lg:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-heading font-bold text-gray-900 leading-tight">
                  Learn Without
                  <span className="text-gradient"> Limits</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Discover thousands of courses from expert instructors. Build new skills, 
                  advance your career, and achieve your learning goals with our comprehensive 
                  online learning platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses" className="btn-primary btn-lg">
                  Explore Courses
                  <ArrowRight size={20} className="ml-2" />
                </Link>
                <Link to="/signup" className="btn-outline btn-lg">
                  Start Learning Free
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Students learning online"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-200 to-primary-300 rounded-2xl transform rotate-3 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Why Choose EduLearn?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide the best learning experience with cutting-edge technology 
              and expert instructors to help you achieve your goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card text-center p-8 hover:shadow-medium transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600">
              Explore our most popular course categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Programming', count: '120+ courses', color: 'bg-blue-500' },
              { name: 'Design', count: '85+ courses', color: 'bg-purple-500' },
              { name: 'Business', count: '95+ courses', color: 'bg-green-500' },
              { name: 'Marketing', count: '70+ courses', color: 'bg-red-500' },
              { name: 'Data Science', count: '60+ courses', color: 'bg-yellow-500' },
              { name: 'Photography', count: '45+ courses', color: 'bg-pink-500' },
            ].map((category, index) => (
              <Link
                key={index}
                to={`/courses?category=${encodeURIComponent(category.name)}`}
                className="card p-6 text-center hover:shadow-medium transition-shadow duration-300 group"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}></div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied learners who have transformed their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-primary-600">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join millions of learners around the world and start your learning journey today. 
            Get access to thousands of courses and expert instructors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn bg-white text-primary-600 hover:bg-gray-50 btn-lg">
              Get Started Free
            </Link>
            <Link to="/courses" className="btn border-white text-white hover:bg-white hover:text-primary-600 btn-lg">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

