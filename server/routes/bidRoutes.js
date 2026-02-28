const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createBid,
  getProjectBids,
  getMyBids,
  acceptBid,
  withdrawBid,
} = require('../controllers/bidController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  authorize('freelancer'),
  [
    body('project').notEmpty().withMessage('Project ID is required'),
    body('amount')
      .isNumeric()
      .withMessage('Bid amount must be a number'),
    body('proposal').trim().notEmpty().withMessage('Proposal is required'),
    body('deliveryDays')
      .isInt({ min: 1 })
      .withMessage('Delivery days must be at least 1'),
  ],
  validate,
  createBid
);

router.get('/my', protect, authorize('freelancer'), getMyBids);
router.get('/project/:projectId', protect, getProjectBids);
router.put('/:id/accept', protect, authorize('client'), acceptBid);
router.put('/:id/withdraw', protect, authorize('freelancer'), withdrawBid);

module.exports = router;
