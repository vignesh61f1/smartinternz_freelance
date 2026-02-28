const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  sendMessage,
  getProjectMessages,
  getConversations,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  [
    body('project').notEmpty().withMessage('Project ID is required'),
    body('receiver').notEmpty().withMessage('Receiver ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  validate,
  sendMessage
);

router.get('/conversations', protect, getConversations);
router.get('/project/:projectId', protect, getProjectMessages);

module.exports = router;
