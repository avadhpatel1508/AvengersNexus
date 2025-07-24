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

    await redisClient.setEx(`otp:${sessionId}`, expiry, otp);
    await redisClient.setEx('activeAttendance', expiry, sessionId);

    io.emit('attendance-started', {
      otp,
      sessionId,
      expiresIn: expiry
    });

    setTimeout(() => markAbsentForAll(sessionId), expiry * 1000);

    console.log(`✅ Attendance started by ${adminId} | OTP: ${otp}`);
    return { sessionId, otp, expiresIn: expiry };
  } catch (error) {
    console.error('❌ Error in startAttendance:', error);
    throw error;
  }
};

// SUBMIT OTP (USER)
const submitOtp = async (userId, enteredOtp, sessionId) => {
  try {
    const storedOtp = await redisClient.get(`otp:${sessionId}`);
    if (!storedOtp) return { success: false, message: 'OTP expired' };

    if (storedOtp !== enteredOtp)
      return { success: false, message: 'Incorrect OTP' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ user: userId, date: today });

    if (existing) {
      if (existing.status === 'Absent') {
        existing.status = 'Present';
        existing.otpSessionId = sessionId;
        await existing.save();
        return { success: true, message: 'Marked present (updated from Absent)' };
      }
      return { success: false, message: 'Attendance already marked' };
    }

    await Attendance.create({
      user: userId,
      date: today,
      status: 'Present',
      otpSessionId: sessionId
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
    const allUsers = await User.find({ role: 'user' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const user of allUsers) {
      const alreadyMarked = await Attendance.findOne({ user: user._id, date: today });
      if (!alreadyMarked) {
        await Attendance.create({
          user: user._id,
          date: today,
          status: 'Absent',
          otpSessionId: sessionId
        });
      }
    }

    console.log(`✅ Marked absentees for session ${sessionId}`);
  } catch (error) {
    console.error('❌ Error in markAbsentForAll:', error);
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

const getLiveAttendees = async (req, res) => {
  try {
    const now = Date.now();

    // Get the latest active session
    const activeSessionEntry = Object.entries(otpSessions).find(
      ([, session]) => session.expiresAt > now
    );

    if (!activeSessionEntry) {
      return res.status(200).json({ success: true, attendees: [] });
    }

    const [sessionId] = activeSessionEntry;

    // Fetch attendees from DB
    const attendees = await Attendance.find({ 
      otpSessionId: sessionId 
    }).populate('user', 'firstName emailId');

    res.status(200).json({ success: true, sessionId, attendees });
  } catch (err) {
    console.error('🔴 Error getting live attendees:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
module.exports = {
  startAttendance,
  submitOtp,
  markAbsentForAll,
  checkactive,
  getLiveAttendees
};
