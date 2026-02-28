const Submission = require('../models/Submission');
const Project = require('../models/Project');
const createNotification = require('../utils/createNotification');
const { PROJECT_STATUS, SUBMISSION_STATUS } = require('../config/constants');

exports.createSubmission = async (req, res, next) => {
  try {
    const project = await Project.findById(req.body.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.selectedFreelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned freelancer can submit work',
      });
    }

    if (project.status !== PROJECT_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: 'Project is not in progress',
      });
    }

    const submission = await Submission.create({
      project: req.body.project,
      freelancer: req.user._id,
      description: req.body.description,
      attachments: req.body.attachments || [],
    });

    await createNotification({
      recipient: project.client,
      type: 'submission_received',
      title: 'New Submission',
      message: `Freelancer submitted work for "${project.title}"`,
      relatedProject: project._id,
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      project: req.params.projectId,
    })
      .populate('freelancer', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

exports.reviewSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    const project = await Project.findById(submission.project);

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project owner can review submissions',
      });
    }

    const { status, clientNotes } = req.body;

    if (!['accepted', 'revision-requested'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status',
      });
    }

    submission.status = status;
    if (clientNotes) submission.clientNotes = clientNotes;
    await submission.save();

    if (status === SUBMISSION_STATUS.ACCEPTED) {
      project.status = PROJECT_STATUS.COMPLETED;
      await project.save();

      await createNotification({
        recipient: submission.freelancer,
        type: 'project_completed',
        title: 'Project Completed!',
        message: `Your work on "${project.title}" has been accepted`,
        relatedProject: project._id,
      });
    } else {
      await createNotification({
        recipient: submission.freelancer,
        type: 'submission_reviewed',
        title: 'Revision Requested',
        message: `Client requested revisions for "${project.title}"`,
        relatedProject: project._id,
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};
