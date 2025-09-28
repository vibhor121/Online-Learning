# EduLearn Backend API

Node.js/Express.js backend for the EduLearn online learning platform.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js      # MongoDB connection
│   └── jwt.js          # JWT utilities
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── courseController.js    # Course management
│   ├── enrollmentController.js # Enrollment handling
│   ├── lessonController.js    # Lesson management
│   └── userController.js      # User management
├── middleware/
│   ├── auth.js         # Authentication middleware
│   └── validation.js   # Input validation
├── models/
│   ├── User.js         # User schema
│   ├── Course.js       # Course schema
│   ├── Lesson.js       # Lesson schema
│   └── Enrollment.js   # Enrollment schema
├── routes/
│   ├── auth.js         # Auth routes
│   ├── courses.js      # Course routes
│   ├── enrollments.js  # Enrollment routes
│   ├── lessons.js      # Lesson routes
│   └── users.js        # User routes
├── package.json
├── server.js           # Entry point
└── env.example         # Environment template
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elearning

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:3000
```

## 🛠 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh JWT token

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:userId/profile` - Get user profile (public)
- `PUT /:userId` - Update user
- `DELETE /:userId` - Delete user (admin only)
- `PATCH /:userId/status` - Toggle user status (admin only)
- `PATCH /:userId/role` - Change user role (admin only)
- `GET /dashboard/stats` - Get dashboard statistics

### Courses (`/api/courses`)
- `GET /` - Get all courses (with filters)
- `GET /:courseId` - Get course by ID
- `POST /` - Create course (instructor only)
- `PUT /:courseId` - Update course (instructor only)
- `DELETE /:courseId` - Delete course (instructor only)
- `PATCH /:courseId/publish` - Toggle publish status
- `POST /:courseId/review` - Add course review
- `GET /instructor/my-courses` - Get instructor's courses

### Lessons (`/api/lessons`)
- `GET /course/:courseId` - Get course lessons
- `GET /:lessonId` - Get lesson by ID
- `POST /course/:courseId` - Create lesson (instructor only)
- `PUT /:lessonId` - Update lesson (instructor only)
- `DELETE /:lessonId` - Delete lesson (instructor only)
- `POST /:lessonId/complete` - Mark lesson complete
- `POST /:lessonId/notes` - Add lesson note
- `GET /:lessonId/notes` - Get lesson notes
- `PATCH /:lessonId/publish` - Toggle lesson publish

### Enrollments (`/api/enrollments`)
- `POST /course/:courseId` - Enroll in course
- `GET /my-enrollments` - Get user enrollments
- `GET /stats` - Get enrollment statistics
- `GET /:enrollmentId` - Get enrollment details
- `PUT /:enrollmentId/progress` - Update progress
- `PATCH /:enrollmentId/drop` - Drop from course
- `POST /:enrollmentId/notes` - Add enrollment note
- `GET /course/:courseId/enrollments` - Get course enrollments (instructor)

## 🔒 Authentication & Authorization

### JWT Authentication
- All protected routes require `Authorization: Bearer <token>` header
- Tokens expire based on `JWT_EXPIRE` environment variable
- Refresh tokens available for seamless user experience

### Role-based Access Control
- **Student**: Basic access to courses and enrollments
- **Instructor**: Can create and manage courses
- **Admin**: Full system access

### Middleware
- `authenticate`: Verify JWT token
- `authorize(roles)`: Check user roles
- `isInstructor`: Instructor or admin access
- `isAdmin`: Admin-only access

## 📊 Database Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'instructor', 'admin'],
  avatar: String,
  bio: String,
  isActive: Boolean,
  // ... other fields
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  instructor: ObjectId (User),
  category: String,
  level: ['Beginner', 'Intermediate', 'Advanced'],
  price: Number,
  thumbnail: String,
  lessons: [ObjectId (Lesson)],
  isPublished: Boolean,
  // ... other fields
}
```

### Lesson Model
```javascript
{
  title: String,
  description: String,
  course: ObjectId (Course),
  order: Number,
  type: ['video', 'text', 'quiz', 'assignment', 'document'],
  content: {
    videoUrl: String,
    textContent: String,
    questions: Array,
    // ... type-specific content
  },
  isPublished: Boolean,
  // ... other fields
}
```

### Enrollment Model
```javascript
{
  student: ObjectId (User),
  course: ObjectId (Course),
  status: ['active', 'completed', 'dropped'],
  progress: {
    completedLessons: Array,
    completionPercentage: Number,
    totalTimeSpent: Number
  },
  // ... other fields
}
```

## 🛡 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **JWT Security**: Secure token handling

## 🚀 Deployment

### Environment Setup
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
JWT_SECRET=<strong-production-secret>
CLIENT_URL=<frontend-production-url>
```

### Deployment Platforms
- **Render**: Easy Node.js deployment
- **Heroku**: Classic PaaS platform
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS deployment

## 🧪 Testing

### Manual Testing
Use Postman or similar tools to test API endpoints:

1. **Authentication Flow**
   ```bash
   POST /api/auth/register
   POST /api/auth/login
   GET /api/auth/profile (with token)
   ```

2. **Course Management**
   ```bash
   GET /api/courses
   POST /api/courses (instructor token)
   GET /api/courses/:id
   ```

3. **Enrollment Flow**
   ```bash
   POST /api/enrollments/course/:courseId
   GET /api/enrollments/my-enrollments
   ```

### Health Check
```bash
GET /api/health
```

## 🐛 Common Issues

### Database Connection
- Verify MongoDB URI format
- Check network access (MongoDB Atlas)
- Ensure database user permissions

### Authentication Issues
- Check JWT_SECRET is set
- Verify token format in requests
- Check token expiration

### CORS Issues
- Set CLIENT_URL correctly
- Check CORS configuration

## 📝 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": { ... } // for paginated responses
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error info", // development only
  "errors": [ ... ] // validation errors
}
```

## 🔄 Development Workflow

1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes
   # Test changes
   
   # Commit and push
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

2. **Code Quality**
   - Follow ESLint configuration
   - Use consistent naming conventions
   - Add proper error handling
   - Include input validation

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

For more information, see the main project README.

