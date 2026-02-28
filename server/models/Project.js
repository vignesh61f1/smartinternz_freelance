const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    selectedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'web-development',
        'mobile-development',
        'design',
        'writing',
        'marketing',
        'data-science',
        'video-editing',
        'other',
      ],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    budget: {
      min: {
        type: Number,
        required: [true, 'Minimum budget is required'],
        min: [0, 'Budget cannot be negative'],
      },
      max: {
        type: Number,
        required: [true, 'Maximum budget is required'],
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled', 'disputed'],
      default: 'open',
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ client: 1 });
projectSchema.index({ selectedFreelancer: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
