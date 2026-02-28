const Project = require('../models/Project');
const { ROLES, PROJECT_STATUS } = require('../config/constants');

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create({
      ...req.body,
      client: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      minBudget,
      maxBudget,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minBudget) query['budget.min'] = { $gte: Number(minBudget) };
    if (maxBudget) query['budget.max'] = { $lte: Number(maxBudget) };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('client', 'name email avatar')
      .populate('selectedFreelancer', 'name email avatar')
      .sort(sort)
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

exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email avatar bio')
      .populate('selectedFreelancer', 'name email avatar bio skills rating');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
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

exports.getMyProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === ROLES.CLIENT
        ? { client: req.user._id }
        : { selectedFreelancer: req.user._id };

    const projects = await Project.find(query)
      .populate('client', 'name email avatar')
      .populate('selectedFreelancer', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    if (project.status !== PROJECT_STATUS.OPEN) {
      return res.status(400).json({
        success: false,
        message: 'Can only update open projects',
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isOwner = project.client.toString() === req.user._id.toString();
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    if (project.status === PROJECT_STATUS.IN_PROGRESS) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a project that is in progress',
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
