const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  suspendUser,
  getAllProjects,
  resolveDispute,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.get('/projects', getAllProjects);
router.put('/projects/:projectId/resolve-dispute', resolveDispute);

module.exports = router;
