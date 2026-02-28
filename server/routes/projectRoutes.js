const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  getMyProjects,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getProjects);
router.get('/my', protect, getMyProjects);
router.get('/:id', getProject);

router.post(
  '/',
  protect,
  authorize('client'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('budget.min')
      .isNumeric()
      .withMessage('Minimum budget must be a number'),
    body('budget.max')
      .isNumeric()
      .withMessage('Maximum budget must be a number'),
    body('deadline').isISO8601().withMessage('Valid deadline date is required'),
  ],
  validate,
  createProject
);

router.put('/:id', protect, authorize('client'), updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
