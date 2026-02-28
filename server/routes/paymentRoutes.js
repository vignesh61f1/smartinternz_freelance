const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createPayment,
  getProjectPayments,
  getMyPayments,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  authorize('client'),
  [
    body('project').notEmpty().withMessage('Project ID is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('method').optional().isIn(['platform', 'external']).withMessage('Method must be platform or external'),
  ],
  validate,
  createPayment
);

router.get('/my', protect, getMyPayments);
router.get('/project/:projectId', protect, getProjectPayments);

module.exports = router;
