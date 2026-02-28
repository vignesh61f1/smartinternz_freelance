const Review = require('../models/Review');
const Project = require('../models/Project');
const User = require('../models/User');
const createNotification = require('../utils/createNotification');
const { PROJECT_STATUS } = require('../config/constants');

exports.createReview = async (req, res, next) => {
  try {
    const { project: projectId, reviewee, rating, comment } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.status !== PROJECT_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed projects',
      });
    }

    const isParticipant =
      project.client.toString() === req.user._id.toString() ||
      (project.selectedFreelancer &&
        project.selectedFreelancer.toString() === req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Only project participants can leave reviews',
      });
    }

    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project',
      });
    }

    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment,
    });

    const allReviews = await Review.find({ reviewee });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(reviewee, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    await createNotification({
      recipient: reviewee,
      type: 'review_received',
      title: 'New Review',
      message: `You received a ${rating}-star review for "${project.title}"`,
      relatedProject: project._id,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ project: req.params.projectId })
      .populate('reviewer', 'name avatar')
      .populate('reviewee', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name avatar')
      .populate('project', 'title')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
