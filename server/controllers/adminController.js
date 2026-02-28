const User = require('../models/User');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const createNotification = require('../utils/createNotification');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalFreelancers,
      totalProjects,
      openProjects,
      completedProjects,
      disputedProjects,
      totalBids,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'freelancer' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'open' }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'disputed' }),
      Bid.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, clients: totalClients, freelancers: totalFreelancers },
        projects: {
          total: totalProjects,
          open: openProjects,
          completed: completedProjects,
          disputed: disputedProjects,
        },
        totalBids,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend admin accounts',
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    if (user.isSuspended) {
      await createNotification({
        recipient: user._id,
        type: 'account_suspended',
        title: 'Account Suspended',
        message: 'Your account has been suspended by an administrator',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: user.isSuspended
        ? 'User suspended successfully'
        : 'User unsuspended successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProjects = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('client', 'name email')
      .populate('selectedFreelancer', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.resolveDispute = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.status !== 'disputed') {
      return res.status(400).json({
        success: false,
        message: 'Project is not in disputed state',
      });
    }

    const { resolution } = req.body;

    if (resolution === 'complete') {
      project.status = 'completed';
    } else if (resolution === 'cancel') {
      project.status = 'cancelled';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Resolution must be "complete" or "cancel"',
      });
    }

    await project.save();

    const recipients = [project.client];
    if (project.selectedFreelancer) {
      recipients.push(project.selectedFreelancer);
    }

    for (const recipientId of recipients) {
      await createNotification({
        recipient: recipientId,
        type: 'general',
        title: 'Dispute Resolved',
        message: `The dispute for "${project.title}" has been resolved. Project marked as ${project.status}.`,
        relatedProject: project._id,
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};
