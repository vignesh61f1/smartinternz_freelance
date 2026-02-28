const Bid = require('../models/Bid');
const Project = require('../models/Project');
const createNotification = require('../utils/createNotification');
const { PROJECT_STATUS, BID_STATUS, ROLES } = require('../config/constants');

exports.createBid = async (req, res, next) => {
  try {
    const project = await Project.findById(req.body.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.status !== PROJECT_STATUS.OPEN) {
      return res.status(400).json({
        success: false,
        message: 'This project is not accepting bids',
      });
    }

    if (project.client.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own project',
      });
    }

    const existingBid = await Bid.findOne({
      project: req.body.project,
      freelancer: req.user._id,
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already placed a bid on this project',
      });
    }

    const bid = await Bid.create({
      ...req.body,
      freelancer: req.user._id,
    });

    await Project.findByIdAndUpdate(project._id, {
      $inc: { bidCount: 1 },
    });

    await createNotification({
      recipient: project.client,
      type: 'bid_received',
      title: 'New Bid Received',
      message: `${req.user.name} placed a bid on "${project.title}"`,
      relatedProject: project._id,
    });

    const populatedBid = await Bid.findById(bid._id).populate(
      'freelancer',
      'name email avatar rating totalReviews skills'
    );

    res.status(201).json({
      success: true,
      data: populatedBid,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ project: req.params.projectId })
      .populate('freelancer', 'name email avatar rating totalReviews skills bio')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('project', 'title status budget deadline client')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error) {
    next(error);
  }
};

exports.acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('project');

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    if (bid.project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can accept bids',
      });
    }

    if (bid.project.status !== PROJECT_STATUS.OPEN) {
      return res.status(400).json({
        success: false,
        message: 'This project is no longer accepting bids',
      });
    }

    bid.status = BID_STATUS.ACCEPTED;
    await bid.save();

    await Bid.updateMany(
      {
        project: bid.project._id,
        _id: { $ne: bid._id },
      },
      { status: BID_STATUS.REJECTED }
    );

    await Project.findByIdAndUpdate(bid.project._id, {
      status: PROJECT_STATUS.IN_PROGRESS,
      selectedFreelancer: bid.freelancer,
    });

    await createNotification({
      recipient: bid.freelancer,
      type: 'bid_accepted',
      title: 'Bid Accepted!',
      message: `Your bid on "${bid.project.title}" has been accepted`,
      relatedProject: bid.project._id,
    });

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};

exports.withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found',
      });
    }

    if (bid.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (bid.status !== BID_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Can only withdraw pending bids',
      });
    }

    bid.status = BID_STATUS.WITHDRAWN;
    await bid.save();

    await Project.findByIdAndUpdate(bid.project, {
      $inc: { bidCount: -1 },
    });

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error) {
    next(error);
  }
};
