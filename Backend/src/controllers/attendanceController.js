const Attendance = require('../models/attendance');
const User = require('../models/user');
const redisClient = require('../config/redish');
const { v4: uuidv4 } = require('uuid');
const generateOtp = require('../utils/generateOtp');
const { io } = require('../socket/attendanceSocket');

// START ATTENDANCE (ADMIN)
// START ATTENDANCE (ADMIN)
const startAttendance = async (io, adminId) => {  
  try {
    const otp = generateOtp();
    const sessionId = uuidv4();
    const expiry = 60; // seconds

    const activeSession = await redisClient.get('activeAttendance');
    if (activeSession) throw new Error('An attendance session is already running');

    // Store OTP and session in Redis
    await redisClient.setEx(`otp:${sessionId}`, expiry, otp);
    await redisClient.setEx('activeAttendance', expiry, sessionId);

    io.emit('attendance-started', {
      otp,
      sessionId,
      expiresIn: expiry
    });

    // Schedule marking absentees and cleanup
    setTimeout(async () => {
      try {
        await markAbsentForAll(sessionId);
        // Clean up Redis keys after marking absentees
        await redisClient.del('activeAttendance');
        await redisClient.del(`otp:${sessionId}`);
        io.emit('attendance-ended', { sessionId });
        console.log(`✅ Attendance session ${sessionId} ended and cleaned up`);
      } catch (error) {
        console.error('❌ Error in attendance cleanup:', error);
      }
    }, expiry * 1000);

    console.log(`✅ Attendance started by ${adminId} | OTP: ${otp}`);
    return { sessionId, otp, expiresIn: expiry };
  } catch (error) {
    console.error('❌ Error in startAttendance:', error);
    throw error;
  }
};

// SUBMIT OTP (USER)
const submitOtp = async (userId, enteredOtp, sessionId, io) => {
  try {
    const storedOtp = await redisClient.get(`otp:${sessionId}`);
    if (!storedOtp) return { success: false, message: 'OTP expired' };

    if (storedOtp !== enteredOtp)
      return { success: false, message: 'Incorrect OTP' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await User.findById(userId); // ✅ make sure this is populated

    if (!user) return { success: false, message: 'User not found' };

    const existing = await Attendance.findOne({ user: userId, date: today });

    if (existing) {
      if (existing.status === 'Absent') {
        existing.status = 'Present';
        existing.otpSessionId = sessionId;
        await existing.save();

      io.to(sessionId).emit('user-attended', {
        userId: user._id,
        name: user.firstName,
        email: user.emailId,
      });



        return { success: true, message: 'Marked present (updated from Absent)' };
      }
      return { success: false, message: 'Attendance already marked' };
    }

    await Attendance.create({
      user: userId,
      date: today,
      status: 'Present',
      otpSessionId: sessionId,
    });

    io.to(sessionId).emit('user-attended', {
      userId: user._id,
      name: user.firstName,
      email: user.emailId,
    });

    return { success: true, message: 'Marked present' };
  } catch (error) {
    console.error('❌ Error in submitOtp:', error);
    return { success: false, message: 'Internal server error' };
  }
};



// MARK ABSENT FOR ALL (after timeout)
const markAbsentForAll = async (sessionId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find users who haven't submitted OTP for this session
    const presentUsers = await Attendance.find({ 
      otpSessionId: sessionId, 
      date: today,
      status: 'Present'
    }).distinct('user'); // Get IDs of users marked present

    // Find all users with role 'user' who aren't marked present
    const usersToMarkAbsent = await User.find({ 
      role: 'user',
      _id: { $nin: presentUsers } // Exclude users already marked present
    });

    // Mark absent for users without an attendance record for today
    const attendancePromises = usersToMarkAbsent.map(async (user) => {
      const alreadyMarked = await Attendance.findOne({ 
        user: user._id, 
        date: today 
      });
      if (!alreadyMarked) {
        return Attendance.create({
          user: user._id,
          date: today,
          status: 'Absent',
          otpSessionId: sessionId
        });
      }
    });

    await Promise.all(attendancePromises.filter(Boolean)); // Execute only valid promises

    console.log(`✅ Marked absentees for session ${sessionId}`);
  } catch (error) {
    console.error('❌ Error in markAbsentForAll:', error);
    throw error; // Rethrow to allow caller to handle
  }
};

// CHECK ACTIVE SESSION (for late joiners)
const checkactive = async (req, res) => {
  try {
    const sessionId = await redisClient.get('activeAttendance');
    if (!sessionId) return res.json({ active: false });

    const otp = await redisClient.get(`otp:${sessionId}`);
    const expiresIn = await redisClient.ttl(`otp:${sessionId}`);

    return res.json({ active: true, otp, sessionId, expiresIn });
  } catch (err) {
    console.error('❌ Error in checkactive:', err);
    res.status(500).json({ active: false, message: 'Internal error' });
  }
};


module.exports = {
  startAttendance,
  submitOtp,
  markAbsentForAll,
  checkactive
};
