const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const UserModel = require('../models/user');
const Attendance = require('../models/attendance');

// In-memory OTP session store (replace with Redis in production)
const otpSessions = {};

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('🧠 New client connected:', socket.id);

    // ✅ Authenticate socket using JWT
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie?.split('token=')[1];

      if (!token) throw new Error('Token missing');

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

    // ✅ Start attendance (admin only)
    socket.on('start-attendance', async ({ adminId }) => {
      try {
        const otp = generateOtp();
        const sessionId = uuidv4();
        const expiresIn = 60; // in seconds
        const expiresAt = Date.now() + expiresIn * 1000;

        otpSessions[sessionId] = {
          otp,
          adminId,
          createdAt: Date.now(),
          expiresAt
        };

        io.emit('attendance-started', { otp, sessionId, expiresIn });
      } catch (error) {
        console.error('❌ Error starting attendance:', error.message);
        socket.emit('attendance-session-failed', {
          message: 'Failed to start session'
        });
      }
    });

    // ✅ Handle OTP submission
    socket.on('submit-otp', async ({ userId, otp, sessionId }) => {
      try {
        const session = otpSessions[sessionId];

        if (!session || Date.now() > session.expiresAt) {
          return socket.emit('attendance-failed', {
            message: 'OTP expired or session not found.'
          });
        }

        if (otp !== session.otp) {
          return socket.emit('attendance-failed', {
            message: 'Incorrect OTP. Try again.'
          });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize time

        const attendanceData = {
          user: userId,
          date: today,
          status: 'Present',
          otpSessionId: sessionId
        };

        try {
          await Attendance.create(attendanceData);
          socket.emit('attendance-success', {
            message: '✅ Attendance marked successfully!'
          });
        } catch (err) {
          if (err.code === 11000) {
            socket.emit('attendance-failed', {
              message: 'Attendance already marked for today.'
            });
          } else {
            console.error('❌ DB error:', err.message);
            socket.emit('attendance-failed', {
              message: 'Internal server error.'
            });
          }
        }
      } catch (err) {
        console.error('❌ OTP submission error:', err.message);
        socket.emit('attendance-failed', {
          message: 'Internal error. Try again.'
        });
      }
    });

    // ✅ Handle "get-active-session" for admin refresh
  socket.on('get-active-session', () => {
  const now = Date.now();
  const activeSessionEntry = Object.entries(otpSessions).find(
    ([sessionId, session]) => session.expiresAt > now
  );

  if (activeSessionEntry) {
    const [sessionId, session] = activeSessionEntry;
    socket.emit('active-session-data', {
      otp: session.otp,
      sessionId,
      expiresAt: session.expiresAt
    });
  }
});


    // ✅ Disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Disconnected:', socket.id);
    });
  });
};
