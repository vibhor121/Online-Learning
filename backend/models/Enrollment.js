const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  progress: {
    completedLessons: [{
      lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
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
    totalTimeSpent: {
      type: Number, // Total time spent in seconds
      default: 0,
      min: [0, 'Total time spent cannot be negative']
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    currentLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }
  },
  completion: {
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Completion percentage cannot be negative'],
      max: [100, 'Completion percentage cannot be more than 100']
    },
    finalScore: {
      type: Number,
      min: [0, 'Final score cannot be negative']
    }
  },
  certificate: {
    isIssued: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date
    },
    certificateId: {
      type: String,
      unique: true,
      sparse: true // Only enforce uniqueness for non-null values
    },
    certificateUrl: {
      type: String
    }
  },
  payment: {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Payment currency is required'],
      default: 'USD'
    },
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'free'],
      default: 'free'
    },
    transactionId: {
      type: String,
      sparse: true
    },
    paidAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'completed'
    }
  },
  notes: [{
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot be more than 1000 characters']
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

// Compound indexes for better query performance
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Virtual for enrollment duration
enrollmentSchema.virtual('enrollmentDuration').get(function() {
  const now = new Date();
  const enrolledAt = this.enrolledAt;
  const diffTime = Math.abs(now - enrolledAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Duration in days
});

// Virtual for formatted time spent
enrollmentSchema.virtual('formattedTimeSpent').get(function() {
  const totalSeconds = this.progress.totalTimeSpent;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
});

// Method to update progress
enrollmentSchema.methods.updateProgress = async function() {
  try {
    // Populate course with lessons to calculate progress
    await this.populate({
      path: 'course',
      populate: {
        path: 'lessons',
        select: '_id'
      }
    });

    const totalLessons = this.course.lessons.length;
    const completedLessons = this.progress.completedLessons.length;
    
    if (totalLessons > 0) {
      this.completion.completionPercentage = Math.round((completedLessons / totalLessons) * 100);
      
      // Mark as completed if all lessons are done
      if (completedLessons === totalLessons && !this.completion.isCompleted) {
        this.completion.isCompleted = true;
        this.completion.completedAt = new Date();
        this.status = 'completed';
        
        // Generate certificate ID if not exists
        if (!this.certificate.certificateId) {
          this.certificate.certificateId = this.generateCertificateId();
          this.certificate.isIssued = true;
          this.certificate.issuedAt = new Date();
        }
      }
    }
    
    return this.save();
  } catch (error) {
    throw new Error(`Failed to update progress: ${error.message}`);
  }
};

// Method to mark lesson as completed
enrollmentSchema.methods.completeLesson = function(lessonId, score = null, timeSpent = 0) {
  // Check if lesson is already completed
  const existingCompletion = this.progress.completedLessons.find(
    completion => completion.lesson.toString() === lessonId.toString()
  );

  if (!existingCompletion) {
    this.progress.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date(),
      score,
      timeSpent
    });
  } else {
    // Update existing completion
    existingCompletion.completedAt = new Date();
    if (score !== null) existingCompletion.score = score;
    if (timeSpent > 0) existingCompletion.timeSpent = timeSpent;
  }

  // Update total time spent
  this.progress.totalTimeSpent += timeSpent;
  this.progress.lastAccessedAt = new Date();
  
  // Update current lesson to next lesson
  // This would require additional logic to find the next lesson in order
};

// Method to check if lesson is completed
enrollmentSchema.methods.isLessonCompleted = function(lessonId) {
  return this.progress.completedLessons.some(
    completion => completion.lesson.toString() === lessonId.toString()
  );
};

// Method to generate certificate ID
enrollmentSchema.methods.generateCertificateId = function() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${randomStr}`.toUpperCase();
};

// Method to add note
enrollmentSchema.methods.addNote = function(content) {
  this.notes.push({
    content,
    createdAt: new Date()
  });
};

// Pre-save middleware to update last accessed time
enrollmentSchema.pre('save', function(next) {
  if (this.isModified('progress.completedLessons') || this.isModified('progress.totalTimeSpent')) {
    this.progress.lastAccessedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);



