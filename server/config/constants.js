module.exports = {
  ROLES: {
    CLIENT: 'client',
    FREELANCER: 'freelancer',
    ADMIN: 'admin',
  },
  PROJECT_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    DISPUTED: 'disputed',
  },
  BID_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    WITHDRAWN: 'withdrawn',
  },
  SUBMISSION_STATUS: {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under-review',
    ACCEPTED: 'accepted',
    REVISION_REQUESTED: 'revision-requested',
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  CATEGORIES: [
    'web-development',
    'mobile-development',
    'design',
    'writing',
    'marketing',
    'data-science',
    'video-editing',
    'other',
  ],
};
