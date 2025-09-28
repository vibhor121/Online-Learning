# EduLearn Frontend

React.js frontend for the EduLearn online learning platform.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment (optional)**
   ```bash
   # Create .env file if you need custom API URL
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   └── ui/
│   │       └── LoadingSpinner.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.js
│   │   │   └── SignupPage.js
│   │   ├── dashboard/
│   │   │   └── DashboardPage.js
│   │   ├── instructor/
│   │   │   ├── InstructorDashboard.js
│   │   │   ├── CreateCoursePage.js
│   │   │   ├── EditCoursePage.js
│   │   │   └── ManageCoursesPage.js
│   │   ├── student/
│   │   │   ├── MyCoursesPage.js
│   │   │   └── CoursePlayerPage.js
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js
│   │   │   └── ManageUsersPage.js
│   │   ├── HomePage.js
│   │   ├── CoursesPage.js
│   │   ├── CourseDetailsPage.js
│   │   ├── ProfilePage.js
│   │   ├── AboutPage.js
│   │   ├── ContactPage.js
│   │   └── NotFoundPage.js
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── courseService.js
│   │   ├── enrollmentService.js
│   │   ├── lessonService.js
│   │   └── userService.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Design System

### Tailwind CSS Configuration
- **Primary Colors**: Blue-based color palette
- **Typography**: Inter (body) + Poppins (headings)
- **Components**: Pre-built utility classes
- **Responsive**: Mobile-first approach

### Component Library
```css
/* Buttons */
.btn-primary     /* Primary button */
.btn-secondary   /* Secondary button */
.btn-outline     /* Outlined button */
.btn-sm          /* Small button */
.btn-lg          /* Large button */

/* Cards */
.card            /* Basic card */
.card-hover      /* Hoverable card */

/* Forms */
.input           /* Input field */
.form-label      /* Form label */
.form-error      /* Error message */

/* Badges */
.badge-primary   /* Primary badge */
.badge-success   /* Success badge */
.badge-warning   /* Warning badge */
```

## 🔧 Key Features

### Authentication System
- JWT-based authentication
- Role-based access control
- Persistent login sessions
- Password validation
- Demo account support

### Responsive Design
- Mobile-first approach
- Responsive navigation
- Touch-friendly interface
- Optimized for all screen sizes

### State Management
- React Context for global state
- React Query for server state
- Local storage for persistence
- Optimistic updates

### Form Handling
- React Hook Form integration
- Real-time validation
- Error handling
- Loading states

## 🚀 Available Scripts

```bash
# Development
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
npm run eject      # Eject from Create React App

# Linting & Formatting
npm run lint       # Run ESLint
npm run format     # Format with Prettier
```

## 🔗 API Integration

### Service Layer
All API calls are handled through service modules:

```javascript
// Example: Course Service
import courseService from '../services/courseService';

const courses = await courseService.getCourses({
  page: 1,
  limit: 12,
  category: 'Programming'
});
```

### Error Handling
- Global error interceptor
- User-friendly error messages
- Automatic token refresh
- Network error handling

### Loading States
- Skeleton loading screens
- Spinner components
- Progressive loading
- Error boundaries

## 🎯 User Flows

### Student Journey
1. **Registration/Login** → Authentication
2. **Browse Courses** → Course discovery
3. **Course Enrollment** → Payment/enrollment
4. **Learning Experience** → Video watching, progress tracking
5. **Completion** → Certificates, reviews

### Instructor Journey
1. **Registration** → Instructor account setup
2. **Course Creation** → Course builder interface
3. **Content Management** → Lesson creation, media upload
4. **Student Management** → Enrollment tracking, analytics
5. **Publishing** → Course publication

### Admin Journey
1. **Dashboard** → System overview
2. **User Management** → User roles, status
3. **Course Moderation** → Course approval, content review
4. **Analytics** → Platform-wide statistics

## 🔒 Route Protection

### Public Routes
- Home page
- Course catalog
- Course details (preview)
- Authentication pages

### Protected Routes
- User dashboard
- Profile management
- Enrolled courses
- Course player

### Role-based Routes
- **Instructor**: Course creation, management
- **Admin**: User management, system settings

## 📱 Responsive Breakpoints

```javascript
// Tailwind CSS breakpoints
sm: '640px',   // Small screens
md: '768px',   // Medium screens
lg: '1024px',  // Large screens
xl: '1280px',  // Extra large screens
'2xl': '1536px' // 2X large screens
```

## 🎨 Styling Guidelines

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#64748B)
- **Success**: Green (#22C55E)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography Scale
- **Headings**: Poppins font family
- **Body**: Inter font family
- **Scale**: Tailwind's default type scale

### Spacing System
- **Base unit**: 4px (0.25rem)
- **Common values**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px

## 🔧 Development Guidelines

### Component Structure
```jsx
import React from 'react';
import { ComponentPropTypes } from './types';

const Component = ({ prop1, prop2 }) => {
  // Hooks
  // Event handlers
  // Render logic
  
  return (
    <div className="component-styles">
      {/* Component content */}
    </div>
  );
};

export default Component;
```

### State Management Patterns
```jsx
// Context usage
const { user, login, logout } = useAuth();

// React Query usage
const { data, loading, error } = useQuery('courses', courseService.getCourses);

// Form handling
const { register, handleSubmit, formState: { errors } } = useForm();
```

## 🚀 Deployment

### Build Process
```bash
# Create production build
npm run build

# Build output in /build directory
# Ready for static hosting
```

### Environment Variables
```env
# Optional: Custom API URL
REACT_APP_API_URL=https://api.yourdomain.com/api

# Optional: Analytics
REACT_APP_GA_TRACKING_ID=GA_TRACKING_ID
```

### Deployment Platforms
- **Vercel**: Automatic deployments
- **Netlify**: Static site hosting
- **AWS S3**: Static website hosting
- **GitHub Pages**: Free hosting option

## 🧪 Testing Strategy

### Component Testing
```jsx
import { render, screen } from '@testing-library/react';
import Component from './Component';

test('renders component correctly', () => {
  render(<Component />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Integration Testing
- Route testing
- API integration tests
- User flow testing
- Authentication flow testing

## 🔍 Performance Optimization

### Code Splitting
```jsx
// Lazy loading components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Route-based splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
```

### Image Optimization
- WebP format support
- Lazy loading images
- Responsive images
- Optimized thumbnails

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx serve -s build
```

## 🐛 Common Issues & Solutions

### CORS Issues
```javascript
// Ensure proxy is set in package.json
"proxy": "http://localhost:5000"
```

### Authentication Issues
```javascript
// Check token storage
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
}
```

### Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Learning Resources

### React Ecosystem
- [React Documentation](https://reactjs.org/)
- [React Router](https://reactrouter.com/)
- [React Query](https://react-query.tanstack.com/)
- [React Hook Form](https://react-hook-form.com/)

### Styling & UI
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [React Hot Toast](https://react-hot-toast.com/)

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

### Code Standards
- Use functional components
- Follow React hooks guidelines
- Use TypeScript for new features
- Write meaningful commit messages

---

For more information, see the main project README.

