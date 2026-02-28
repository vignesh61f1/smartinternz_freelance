const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Submission description is required'],
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['submitted', 'under-review', 'accepted', 'revision-requested'],
      default: 'submitted',
    },
    clientNotes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ project: 1 });
submissionSchema.index({ freelancer: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
