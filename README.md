# EduLearn - Online Learning Platform

A comprehensive e-learning platform built with React.js, Node.js, Express.js, and MongoDB. This platform allows users to enroll in courses, watch videos, complete assignments, and track their learning progress.

## 🚀 Features

### User Management
- **User Authentication**: JWT-based secure authentication
- **Role-based Access Control**: Student, Instructor, and Admin roles
- **User Profiles**: Customizable user profiles with avatar support
- **Password Management**: Secure password hashing and change functionality

### Course Management
- **Course Creation**: Instructors can create and manage courses
- **Course Categories**: Organized course categories (Programming, Design, Business, etc.)
- **Course Reviews**: Students can rate and review courses
- **Course Publishing**: Draft and publish course functionality

### Learning Experience
- **Video Lessons**: Support for video-based learning content
- **Multiple Content Types**: Video, text, quiz, assignment, and document lessons
- **Progress Tracking**: Track learning progress and completion
- **Course Enrollment**: Easy course enrollment system
- **Certificates**: Automatic certificate generation upon course completion

### Dashboard & Analytics
- **Student Dashboard**: Track enrolled courses and progress
- **Instructor Dashboard**: Manage courses and view student analytics
- **Admin Dashboard**: System-wide user and course management

## 🛠 Technology Stack

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware

## 📁 Project Structure

```
online-Elearning/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── jwt.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── enrollmentController.js
│   │   ├── lessonController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   └── Enrollment.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   ├── lessons.js
│   │   └── users.js
│   ├── package.json
│   ├── server.js
│   └── env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── instructor/
│   │   │   ├── student/
│   │   │   └── admin/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── courseService.js
│   │   │   ├── enrollmentService.js
│   │   │   ├── lessonService.js
│   │   │   └── userService.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-Elearning
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   npm run install-server

   # Install frontend dependencies
   npm run install-client
   ```

3. **Environment Setup**

   **Backend Environment (.env)**
   ```bash
   cd backend
   cp env.example .env
   ```

   Edit the `.env` file with your configuration:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elearning?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   JWT_EXPIRE=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Client Configuration
   CLIENT_URL=http://localhost:3000
   ```

   **Frontend Environment (optional)**
   ```bash
   cd frontend
   # Create .env file if you need custom API URL
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

### Database Setup

#### Option 1: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Add your connection string to the `MONGODB_URI` in your `.env` file

#### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use local connection string: `mongodb://localhost:27017/elearning`

### Running the Application

#### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run them separately:

# Backend only (http://localhost:5000)
npm run server

# Frontend only (http://localhost:3000)
npm run client
```

#### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

## 🔐 Authentication & Demo Accounts

The application includes role-based authentication with three user types:

### Demo Accounts (for testing)
- **Student**: `student@demo.com` / `password123`
- **Instructor**: `instructor@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`

### User Roles & Permissions

#### Student
- Browse and enroll in courses
- Watch lessons and track progress
- Add notes and complete assignments
- Rate and review courses
- View personal dashboard

#### Instructor
- Create and manage courses
- Add lessons and content
- View student enrollments
- Publish/unpublish courses
- Access instructor dashboard

#### Admin
- Manage all users and courses
- View system-wide analytics
- Change user roles and status
- Access admin dashboard

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Courses
- `GET /api/courses` - Get all courses (with filters)
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (instructor)
- `PUT /api/courses/:id` - Update course (instructor)
- `DELETE /api/courses/:id` - Delete course (instructor)

### Enrollments
- `POST /api/enrollments/course/:courseId` - Enroll in course
- `GET /api/enrollments/my-enrollments` - Get user enrollments
- `PUT /api/enrollments/:id/progress` - Update progress

### Lessons
- `GET /api/lessons/course/:courseId` - Get course lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons/course/:courseId` - Create lesson (instructor)
- `POST /api/lessons/:id/complete` - Mark lesson complete

## 🎨 UI/UX Features

### Design System
- **Modern Design**: Clean, professional interface
- **Responsive**: Mobile-first responsive design
- **Accessibility**: WCAG compliant components
- **Dark Mode Ready**: Prepared for dark mode implementation

### Components
- **Reusable UI Components**: Button, Input, Card, Modal, etc.
- **Form Handling**: Robust form validation and error handling
- **Loading States**: Comprehensive loading and error states
- **Toast Notifications**: User-friendly notifications

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
# Build the frontend
cd frontend
npm run build

# Deploy the build folder to your hosting service
```

### Backend Deployment (Render/Heroku)
```bash
# Ensure your environment variables are set
# Deploy the backend folder to your hosting service
```

### Environment Variables for Production
Make sure to set all required environment variables in your hosting platform:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CLIENT_URL` (your frontend URL)

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Course browsing and enrollment
- [ ] Lesson viewing and progress tracking
- [ ] Instructor course creation
- [ ] Admin user management
- [ ] Responsive design on mobile devices

### API Testing
Use tools like Postman or Insomnia to test API endpoints:
1. Import the API collection
2. Set up environment variables
3. Test authentication flows
4. Verify CRUD operations

## 🔧 Development

### Code Style
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

#### CORS Issues
- Verify `CLIENT_URL` in backend environment
- Check CORS configuration in server.js

#### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration settings
- Clear browser localStorage if needed

#### Build Issues
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify environment variables are set

## 📚 Learning Resources

### For Developers
- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### For Users
- User guides and tutorials will be available in the application
- Video tutorials for instructors on course creation
- Student guides for maximizing learning experience

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation for common solutions
- Review the troubleshooting section

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React.js team for the amazing framework
- Express.js community for the robust backend framework
- MongoDB for the flexible database solution
- Tailwind CSS for the utility-first CSS framework
- All open-source contributors who made this project possible

---

**Happy Learning! 🎓**

# Online-Learning
