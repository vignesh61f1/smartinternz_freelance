const Notification = require('../models/Notification');

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedProject,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedProject,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

module.exports = createNotification;
