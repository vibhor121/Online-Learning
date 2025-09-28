const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Enrollment = require('./models/Enrollment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    return createSampleData();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function createSampleData() {
  try {
    console.log('🚀 Creating sample data...');

    // Create sample instructors
    const instructor1 = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.instructor@example.com',
      password: 'password123',
      role: 'instructor',
      bio: 'Full-stack developer with 10+ years of experience'
    });
    await instructor1.save();

    const instructor2 = new User({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.instructor@example.com',
      password: 'password123',
      role: 'instructor',
      bio: 'Data scientist and Python expert'
    });
    await instructor2.save();

    const instructor3 = new User({
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.instructor@example.com',
      password: 'password123',
      role: 'instructor',
      bio: 'UI/UX designer with focus on user experience'
    });
    await instructor3.save();

    // Create sample courses
    const course1 = new Course({
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js and build amazing websites! This comprehensive course covers everything you need to become a full-stack web developer. Start from the basics and build real-world projects.',
      shortDescription: 'Master web development from scratch with hands-on projects',
      instructor: instructor1._id,
      category: 'Web Development',
      level: 'Beginner',
      price: 99.99,
      duration: 40,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      whatYouWillLearn: [
        'Build responsive websites with HTML, CSS, and JavaScript',
        'Create dynamic web applications with React',
        'Develop backend APIs with Node.js and Express',
        'Work with databases (MongoDB)',
        'Deploy applications to production'
      ],
      requirements: [
        'Basic computer skills',
        'No programming experience required',
        'Access to a computer with internet'
      ],
      tags: ['html', 'css', 'javascript', 'react', 'nodejs'],
      isPublished: true,
      publishedAt: new Date(),
      enrollmentCount: 1234,
      averageRating: 4.8,
      totalRatings: 456
    });
    await course1.save();

    const course2 = new Course({
      title: 'Python for Data Science',
      description: 'Master Python programming and data analysis with pandas, numpy, and matplotlib. Learn to work with real datasets, create visualizations, and build machine learning models.',
      shortDescription: 'Learn Python for data analysis and machine learning',
      instructor: instructor2._id,
      category: 'Data Science',
      level: 'Intermediate',
      price: 79.99,
      duration: 30,
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
      whatYouWillLearn: [
        'Python programming fundamentals',
        'Data manipulation with pandas',
        'Data visualization with matplotlib and seaborn',
        'Statistical analysis techniques',
        'Introduction to machine learning'
      ],
      requirements: [
        'Basic programming knowledge helpful but not required',
        'High school level mathematics',
        'Computer with Python installed'
      ],
      tags: ['python', 'data-science', 'pandas', 'numpy', 'matplotlib'],
      isPublished: true,
      publishedAt: new Date(),
      enrollmentCount: 892,
      averageRating: 4.6,
      totalRatings: 234
    });
    await course2.save();

    const course3 = new Course({
      title: 'UI/UX Design Masterclass',
      description: 'Learn to design beautiful and user-friendly interfaces with Figma and Adobe XD. Master design principles, user research, prototyping, and create stunning designs.',
      shortDescription: 'Master UI/UX design principles and tools',
      instructor: instructor3._id,
      category: 'Design',
      level: 'Beginner',
      price: 89.99,
      duration: 25,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
      whatYouWillLearn: [
        'Design thinking and user research',
        'Create wireframes and prototypes',
        'Master Figma and Adobe XD',
        'Design systems and style guides',
        'Mobile and web design best practices'
      ],
      requirements: [
        'Creative mindset',
        'Basic computer skills',
        'No design experience required'
      ],
      tags: ['ui', 'ux', 'figma', 'adobe-xd', 'design'],
      isPublished: true,
      publishedAt: new Date(),
      enrollmentCount: 567,
      averageRating: 4.9,
      totalRatings: 123
    });
    await course3.save();

    const course4 = new Course({
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch. Understand variables, functions, objects, and modern ES6+ features. Build interactive web applications.',
      shortDescription: 'Master JavaScript programming language',
      instructor: instructor1._id,
      category: 'Programming',
      level: 'Beginner',
      price: 49.99,
      duration: 20,
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
      whatYouWillLearn: [
        'JavaScript syntax and fundamentals',
        'DOM manipulation',
        'Event handling',
        'Asynchronous programming',
        'Modern ES6+ features'
      ],
      requirements: [
        'Basic HTML and CSS knowledge',
        'Text editor or IDE'
      ],
      tags: ['javascript', 'programming', 'web'],
      isPublished: true,
      publishedAt: new Date(),
      enrollmentCount: 2156,
      averageRating: 4.7,
      totalRatings: 789
    });
    await course4.save();

    const course5 = new Course({
      title: 'React Native Mobile Development',
      description: 'Build native mobile apps for iOS and Android using React Native. Learn navigation, state management, and publish to app stores.',
      shortDescription: 'Create mobile apps with React Native',
      instructor: instructor1._id,
      category: 'Mobile Development',
      level: 'Advanced',
      price: 129.99,
      duration: 35,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      whatYouWillLearn: [
        'React Native fundamentals',
        'Navigation between screens',
        'State management with Redux',
        'Native device features',
        'Publishing to app stores'
      ],
      requirements: [
        'Strong JavaScript knowledge',
        'React experience required',
        'Mobile development environment setup'
      ],
      tags: ['react-native', 'mobile', 'ios', 'android'],
      isPublished: true,
      publishedAt: new Date(),
      enrollmentCount: 445,
      averageRating: 4.5,
      totalRatings: 156
    });
    await course5.save();

    // Create sample lessons for course1
    const lesson1 = new Lesson({
      title: 'Introduction to Web Development',
      description: 'Overview of web development technologies and what we will learn',
      course: course1._id,
      order: 1,
      type: 'video',
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
        videoDuration: 900 // 15 minutes
      },
      isPreview: true,
      isPublished: true,
      publishedAt: new Date()
    });
    await lesson1.save();

    const lesson2 = new Lesson({
      title: 'HTML Basics',
      description: 'Learn HTML tags, elements, and structure',
      course: course1._id,
      order: 2,
      type: 'video',
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
        videoDuration: 1200 // 20 minutes
      },
      isPublished: true,
      publishedAt: new Date()
    });
    await lesson2.save();

    const lesson3 = new Lesson({
      title: 'CSS Styling',
      description: 'Style your HTML with CSS properties and selectors',
      course: course1._id,
      order: 3,
      type: 'video',
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
        videoDuration: 1800 // 30 minutes
      },
      isPublished: true,
      publishedAt: new Date()
    });
    await lesson3.save();

    // Add lessons to course
    course1.lessons = [lesson1._id, lesson2._id, lesson3._id];
    await course1.save();

    // Create sample lessons for course2
    const pythonLesson1 = new Lesson({
      title: 'Python Introduction',
      description: 'Getting started with Python programming',
      course: course2._id,
      order: 1,
      type: 'video',
      content: {
        videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        videoDuration: 600
      },
      isPreview: true,
      isPublished: true,
      publishedAt: new Date()
    });
    await pythonLesson1.save();

    course2.lessons = [pythonLesson1._id];
    await course2.save();

    // Update instructor's created courses
    instructor1.createdCourses = [course1._id, course4._id, course5._id];
    await instructor1.save();

    instructor2.createdCourses = [course2._id];
    await instructor2.save();

    instructor3.createdCourses = [course3._id];
    await instructor3.save();

    console.log('✅ Sample data created successfully!');
    console.log(`Created ${await Course.countDocuments()} courses`);
    console.log(`Created ${await Lesson.countDocuments()} lessons`);
    console.log(`Created ${await User.countDocuments({ role: 'instructor' })} instructors`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
    console.log('📤 Database connection closed');
  }
}

