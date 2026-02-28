const Message = require('../models/Message');
const Project = require('../models/Project');

exports.sendMessage = async (req, res, next) => {
  try {
    const { project: projectId, receiver, content } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isParticipant =
      project.client.toString() === req.user._id.toString() ||
      (project.selectedFreelancer &&
        project.selectedFreelancer.toString() === req.user._id.toString());

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this project',
      });
    }

    const message = await Message.create({
      project: projectId,
      sender: req.user._id,
      receiver,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectMessages = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const isParticipant =
      project.client.toString() === req.user._id.toString() ||
      (project.selectedFreelancer &&
        project.selectedFreelancer.toString() === req.user._id.toString());

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these messages',
      });
    }

    const messages = await Message.find({ project: req.params.projectId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort('createdAt');

    await Message.updateMany(
      {
        project: req.params.projectId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$project',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    await Message.populate(messages, [
      { path: 'lastMessage.sender', select: 'name avatar' },
      { path: 'lastMessage.receiver', select: 'name avatar' },
      { path: '_id', select: 'title status' },
    ]);

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
