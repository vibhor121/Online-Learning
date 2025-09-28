const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [100, 'Lesson title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Lesson description is required'],
    maxlength: [1000, 'Lesson description cannot be more than 1000 characters']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  type: {
    type: String,
    required: [true, 'Lesson type is required'],
    enum: ['video', 'text', 'quiz', 'assignment', 'document']
  },
  content: {
    // For video lessons
    videoUrl: {
      type: String,
      trim: true
    },
    videoDuration: {
      type: Number, // Duration in seconds
      min: [0, 'Video duration cannot be negative']
    },
    
    // For text lessons
    textContent: {
      type: String,
      maxlength: [10000, 'Text content cannot be more than 10000 characters']
    },
    
    // For document lessons
    documentUrl: {
      type: String,
      trim: true
    },
    documentType: {
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'other']
    },
    
    // For quiz lessons
    questions: [{
      question: {
        type: String,
        required: function() {
          return this.parent().type === 'quiz';
        }
      },
      options: [{
        text: String,
        isCorrect: {
          type: Boolean,
          default: false
        }
      }],
      explanation: String,
      points: {
        type: Number,
        default: 1,
        min: [0, 'Points cannot be negative']
      }
    }],
    
    // For assignment lessons
    assignmentInstructions: {
      type: String,
      maxlength: [2000, 'Assignment instructions cannot be more than 2000 characters']
    },
    assignmentDeadline: {
      type: Date
    },
    maxScore: {
      type: Number,
      min: [0, 'Max score cannot be negative']
    }
  },
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['link', 'file', 'document'],
      default: 'link'
    }
  }],
  isPreview: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  completions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      min: [0, 'Score cannot be negative']
    },
    timeSpent: {
      type: Number, // Time spent in seconds
      min: [0, 'Time spent cannot be negative']
    }
  }],
  notes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
    },
    timestamp: {
      type: Number, // Timestamp in seconds for video lessons
      min: [0, 'Timestamp cannot be negative']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
lessonSchema.index({ course: 1, order: 1 });
lessonSchema.index({ course: 1, isPublished: 1 });
lessonSchema.index({ type: 1 });

// Virtual for completion count
lessonSchema.virtual('completionCount').get(function() {
  return this.completions ? this.completions.length : 0;
});

// Virtual for formatted duration
lessonSchema.virtual('formattedDuration').get(function() {
  if (this.content && this.content.videoDuration) {
    const minutes = Math.floor(this.content.videoDuration / 60);
    const seconds = this.content.videoDuration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return null;
});

// Method to mark lesson as completed by user
lessonSchema.methods.markCompleted = function(userId, score = null, timeSpent = null) {
  const existingCompletion = this.completions.find(
    completion => completion.user.toString() === userId.toString()
  );

  if (!existingCompletion) {
    this.completions.push({
      user: userId,
      score,
      timeSpent,
      completedAt: new Date()
    });
  } else {
    // Update existing completion
    if (score !== null) existingCompletion.score = score;
    if (timeSpent !== null) existingCompletion.timeSpent = timeSpent;
    existingCompletion.completedAt = new Date();
  }
};

// Method to check if lesson is completed by user
lessonSchema.methods.isCompletedByUser = function(userId) {
  return this.completions.some(
    completion => completion.user.toString() === userId.toString()
  );
};

// Method to add note
lessonSchema.methods.addNote = function(userId, content, timestamp = null) {
  this.notes.push({
    user: userId,
    content,
    timestamp,
    createdAt: new Date()
  });
};

// Pre-save middleware to set published date
lessonSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Lesson', lessonSchema);



