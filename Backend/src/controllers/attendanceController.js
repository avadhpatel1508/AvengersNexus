const Attendance = require('../models/attendance');
const User = require('../models/user');
const redisClient = require('../config/redish');
const { v4: uuidv4 } = require('uuid');
const generateOtp = require('../utils/generateOtp');

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
      expiresIn: expiry,
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

    const user = await User.findById(userId);
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
      status: 'Present',
    }).distinct('user');

    // Find all users with role 'user' who aren't marked present
    const usersToMarkAbsent = await User.find({
      role: 'user',
      _id: { $nin: presentUsers },
    });

    // Mark absent for users without an attendance record for today
    const attendancePromises = usersToMarkAbsent.map(async (user) => {
      const alreadyMarked = await Attendance.findOne({
        user: user._id,
        date: today,
      });
      if (!alreadyMarked) {
        return Attendance.create({
          user: user._id,
          date: today,
          status: 'Absent',
          otpSessionId: sessionId,
        });
      }
    });

    await Promise.all(attendancePromises.filter(Boolean));

    console.log(`✅ Marked absentees for session ${sessionId}`);
  } catch (error) {
    console.error('❌ Error in markAbsentForAll:', error);
    throw error;
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

// GET ATTENDANCE BY DATE
const getAttendanceByDate = async (req, res) => {
  try {
    const inputDate = new Date(req.params.date);

    const adjustedDate = new Date(inputDate);
    adjustedDate.setDate(adjustedDate.getDate() - 1);

    const startOfDay = new Date(adjustedDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(adjustedDate.setUTCHours(23, 59, 59, 999));

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate('user', 'firstName emailId');

    res.status(200).json({
      success: true,
      date: req.params.date,
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};

// GET ATTENDANCE BY USER ID
const getAttendanceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure req.user exists
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const loggedInUserId = req.user._id?.toString();
    const loggedInUserRole = req.user.role;

    // Only allow if the user is viewing their own data OR is admin
    if (loggedInUserId !== userId && loggedInUserRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });
    return res.status(200).json({ success: true, userId, attendance });

  } catch (err) {
    console.error('Error fetching attendance by user ID:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// GET MONTHLY SUMMARY FOR LOGGED-IN USER
const getMonthlySummary = async (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ success: false, message: 'Month and year are required' });
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 1);

  try {
    // Logged-in user's ID from token
    const userId = req.user._id;

    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: 1 });

    const daysPresent = attendanceRecords.filter(r => r.status === 'Present').length;
    const daysAbsent = attendanceRecords.length - daysPresent;

    return res.status(200).json({
      success: true,
      userId,
      month: monthNum,
      year: yearNum,
      totalDays: attendanceRecords.length,
      daysPresent,
      daysAbsent,
      records: attendanceRecords
    });
  } catch (err) {
    console.error('❌ Error getting monthly summary:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  startAttendance,
  submitOtp,
  markAbsentForAll,
  checkactive,
  getAttendanceByDate,
  getAttendanceByUserId,
  getMonthlySummary,
};