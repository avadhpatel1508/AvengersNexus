// socket/chatSocket.js

const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const Message = require('../models/Message');

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('💬 New socket connection:', socket.id);

    // Authenticate the user
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie?.split('token=')[1];

      if (!token) throw new Error('Token missing');

      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const user = await UserModel.findById(decoded._id);

      if (!user) throw new Error('User not found');
      socket.user = user;

      console.log(`✅ Authenticated: ${user.name} (${socket.id})`);
    } catch (err) {
      console.error('❌ Socket auth failed:', err.message);
      socket.emit('unauthorized', { success: false, message: 'Unauthorized access' });
      return socket.disconnect();
    }

    // Join mission-specific chat room
    socket.on('joinMissionRoom', (missionId) => {
      if (!missionId) return;
      socket.join(missionId);
      console.log(`🚪 ${socket.user.name} joined room: ${missionId}`);
    });

    // Handle sending a message
    socket.on('sendMessage', async ({ missionId, senderId, message }) => {
      if (!missionId || !senderId || !message?.trim()) {
        console.warn(`❗ Invalid sendMessage payload from ${socket.id}`);
        return;
      }

      try {
        const newMessage = new Message({
          mission: missionId,
          sender: senderId,
          message: message.trim(),
        });

        const savedMessage = await newMessage.save();
        const populated = await savedMessage.populate('sender', 'name email');

        const messagePayload = {
          _id: populated._id,
          missionId,
          message: populated.message,
          sender: {
            _id: populated.sender._id,
            name: populated.sender.name,
            email: populated.sender.email,
          },
          timestamp: populated.timestamp,
        };

        io.to(missionId).emit('receiveMessage', messagePayload);
        console.log(`📨 Message sent in room ${missionId} by ${populated.sender.name}`);
      } catch (err) {
        console.error('❌ Error sending message:', err.message);
        socket.emit('errorMessage', 'Failed to send message.');
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Chat disconnected:', socket.id);
    });
  });
};
