const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createReview,
  getProjectReviews,
  getUserReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  [
    body('project').notEmpty().withMessage('Project ID is required'),
    body('reviewee').notEmpty().withMessage('Reviewee ID is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  validate,
  createReview
);

router.get('/project/:projectId', getProjectReviews);
router.get('/user/:userId', getUserReviews);

module.exports = router;
