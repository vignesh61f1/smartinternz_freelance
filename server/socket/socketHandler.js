const jwt = require('jsonwebtoken');
const User = require('../models/User');

const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || user.isSuspended) {
        return next(new Error('User not found or suspended'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    onlineUsers.set(userId, socket.id);

    console.log(`User connected: ${socket.user.name} (${userId})`);
    io.emit('user_online', { userId });

    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    socket.on('send_message', (data) => {
      const { projectId, receiverId, message } = data;

      io.to(`project_${projectId}`).emit('new_message', {
        ...message,
        sender: {
          _id: socket.user._id,
          name: socket.user.name,
          avatar: socket.user.avatar,
        },
      });

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('notification', {
          type: 'new_message',
          title: 'New Message',
          message: `${socket.user.name} sent you a message`,
          projectId,
        });
      }
    });

    socket.on('typing', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_typing', {
        userId,
        name: socket.user.name,
      });
    });

    socket.on('stop_typing', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_stop_typing', {
        userId,
      });
    });

    socket.on('bid_placed', ({ projectId, bid }) => {
      io.to(`project_${projectId}`).emit('new_bid', bid);
    });

    socket.on('bid_accepted', ({ projectId, freelancerId }) => {
      const freelancerSocketId = onlineUsers.get(freelancerId);
      if (freelancerSocketId) {
        io.to(freelancerSocketId).emit('notification', {
          type: 'bid_accepted',
          title: 'Bid Accepted',
          message: 'Your bid has been accepted!',
          projectId,
        });
      }
      io.to(`project_${projectId}`).emit('project_updated', {
        projectId,
        status: 'in-progress',
      });
    });

    socket.on('submission_created', ({ projectId, clientId }) => {
      const clientSocketId = onlineUsers.get(clientId);
      if (clientSocketId) {
        io.to(clientSocketId).emit('notification', {
          type: 'submission_received',
          title: 'New Submission',
          message: 'A freelancer submitted work for your project',
          projectId,
        });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('user_offline', { userId });
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

const getOnlineUsers = () => onlineUsers;

module.exports = { initializeSocket, getOnlineUsers };
