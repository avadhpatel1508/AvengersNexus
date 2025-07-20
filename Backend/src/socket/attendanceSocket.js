const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const attendanceController = require('../controllers/attendanceController');
const { v4: uuidv4 } = require('uuid');
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('⚡ New client connected:', socket.id);

    // Authenticate user from token (used for all socket events)
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.cookie?.split('token=')[1];
      if (!token) throw new Error('Token not provided');

      const decoded = jwt.verify(token, process.env.JWT_KEY);
      const user = await UserModel.findById(decoded._id);
      if (!user) throw new Error('User not found');

      socket.user = user;
    } catch (err) {
      console.error('❌ Socket auth error:', err.message);
      socket.emit('unauthorized', { success: false, message: 'Unauthorized access' });
      socket.disconnect();
      return;
    }

    // 🚀 START ATTENDANCE — Only admin
    socket.on("start-attendance", async ({ adminId }) => {
  try {
    const result = await attendanceController.startAttendance(io, adminId); // ← This is critical
    socket.emit("otp-generated", result); // Optional: reply back to admin only
    socket.emit('attendance-started', { otp, sessionId, expiresIn });

  } catch (error) {
    socket.emit("attendance-session-failed", {
      message: error.message,
    });
  }
});

    // 🧑‍💼 SUBMIT OTP — All users
    socket.on('submit-otp', async ({ userId, otp, sessionId }) => {
  try {
    const result = await attendanceController.submitOtp(userId, otp, sessionId);

    if (result.success) {
      socket.emit('attendance-success', { message: result.message });
    } else {
      socket.emit('attendance-failed', { message: result.message });
    }
  } catch (err) {
    console.error('❌ OTP submission failed:', err.message);
    socket.emit('attendance-failed', {
      message: '❌ Internal error. Try again.'
    });
  }
});


    socket.on('disconnect', () => {
      console.log('🔌 Disconnected:', socket.id);
    });
  });
};
