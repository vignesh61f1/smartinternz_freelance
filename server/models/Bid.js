const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount cannot be negative'],
    },
    proposal: {
      type: String,
      required: [true, 'Proposal is required'],
      maxlength: [2000, 'Proposal cannot exceed 2000 characters'],
    },
    deliveryDays: {
      type: Number,
      required: [true, 'Delivery timeline is required'],
      min: [1, 'Delivery must be at least 1 day'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

bidSchema.index({ project: 1, freelancer: 1 }, { unique: true });
bidSchema.index({ freelancer: 1 });
bidSchema.index({ status: 1 });

module.exports = mongoose.model('Bid', bidSchema);
