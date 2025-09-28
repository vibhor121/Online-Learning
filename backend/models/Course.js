const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Course title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [2000, 'Course description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Programming',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Machine Learning',
      'Design',
      'Business',
      'Marketing',
      'Photography',
      'Music',
      'Language',
      'Other'
    ]
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  cloudinaryPublicId: {
    type: String,
    default: null
  },
  trailer: {
    type: String,
    default: ''
  },
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Course duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  lessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true,
    required: true
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    required: [true, 'Course language is required'],
    default: 'English'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ enrollmentCount: -1 });

// Virtual for formatted price
courseSchema.virtual('formattedPrice').get(function() {
  const price = this.price || 0;
  const currency = this.currency || 'USD';
  return `${currency} ${price.toFixed(2)}`;
});

// Virtual for lesson count
courseSchema.virtual('lessonCount').get(function() {
  return this.lessons ? this.lessons.length : 0;
});

// Pre-save middleware to update lastUpdated
courseSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to calculate average rating
courseSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
    return;
  }

  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.averageRating = (totalRating / this.reviews.length).toFixed(1);
  this.totalRatings = this.reviews.length;
};

// Method to add a review
courseSchema.methods.addReview = function(userId, rating, comment) {
  // Check if user already reviewed this course
  const existingReviewIndex = this.reviews.findIndex(
    review => review.user.toString() === userId.toString()
  );

  if (existingReviewIndex > -1) {
    // Update existing review
    this.reviews[existingReviewIndex].rating = rating;
    this.reviews[existingReviewIndex].comment = comment;
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment
    });
  }

  this.calculateAverageRating();
};

module.exports = mongoose.model('Course', courseSchema);
