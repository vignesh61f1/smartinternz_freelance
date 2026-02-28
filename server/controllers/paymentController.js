const Payment = require('../models/Payment');
const Project = require('../models/Project');
const createNotification = require('../utils/createNotification');

exports.createPayment = async (req, res, next) => {
  try {
    const { project: projectId, amount, method, transactionId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the project owner can record payment' });
    }

    if (project.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be recorded for completed projects',
      });
    }

    const freelancerId = project.selectedFreelancer?._id ?? project.selectedFreelancer;
    if (!freelancerId) {
      return res.status(400).json({ success: false, message: 'No freelancer assigned to this project' });
    }

    const payment = await Payment.create({
      project: projectId,
      client: req.user._id,
      freelancer: freelancerId,
      amount: Number(amount),
      status: 'completed',
      method: method || 'platform',
      transactionId: transactionId || '',
    });

    await createNotification({
      recipient: freelancerId,
      type: 'payment_received',
      title: 'Payment Received',
      message: `You received a payment of $${payment.amount} for "${project.title}"`,
      relatedProject: projectId,
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

exports.getProjectPayments = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isClient = project.client.toString() === req.user._id.toString();
    const isFreelancer =
      project.selectedFreelancer &&
      (project.selectedFreelancer._id?.toString() ?? project.selectedFreelancer.toString()) === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view these payments' });
    }

    const payments = await Payment.find({ project: req.params.projectId })
      .populate('client', 'name email')
      .populate('freelancer', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'client'
        ? { client: req.user._id }
        : { freelancer: req.user._id };

    const payments = await Payment.find(query)
      .populate('project', 'title')
      .populate('client', 'name')
      .populate('freelancer', 'name')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
