const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createSubmission,
  getProjectSubmissions,
  reviewSubmission,
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  authorize('freelancer'),
  [
    body('project').notEmpty().withMessage('Project ID is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Submission description is required'),
  ],
  validate,
  createSubmission
);

router.get('/project/:projectId', protect, getProjectSubmissions);

router.put(
  '/:id/review',
  protect,
  authorize('client'),
  [
    body('status')
      .isIn(['accepted', 'revision-requested'])
      .withMessage('Status must be accepted or revision-requested'),
  ],
  validate,
  reviewSubmission
);

module.exports = router;
