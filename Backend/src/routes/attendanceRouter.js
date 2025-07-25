const express = require('express');
const attendanceRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const Attendance = require('../models/attendance');
const attendanceController = require('../controllers/attendanceController');

// 📅 Get attendance for a specific date (Admin/User)
attendanceRouter.get('/date/:date', userMiddleware, async (req, res) => {
  try {
    const selectedDate = new Date(req.params.date);

    const startOfDay = new Date(selectedDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setUTCHours(23, 59, 59, 999));

    const attendance = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('user', 'firstName emailId');

    res.status(200).json({
      success: true,
      date: startOfDay.toISOString().split('T')[0],
      attendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
});


// 👤 Get all attendance for a specific user
attendanceRouter.get('/:userId', userMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.result._id.toString() !== userId && req.result.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });
    res.status(200).json({ success: true, userId, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// 🚀 Start a new attendance session (Admin)
attendanceRouter.post('/start', adminMiddleware, async (req, res) => {
  try {
    const result = await attendanceController.startAttendance(req.app.get('io'), req.result._id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Submit OTP (User)
attendanceRouter.post('/submit', userMiddleware, async (req, res) => {
  const { enteredOtp, sessionId } = req.body;
  const result = await attendanceController.submitOtp(req.result._id, enteredOtp, sessionId);
  res.status(result.success ? 200 : 400).json(result);
});

// ❌ Forcefully mark absentees (Admin)
attendanceRouter.post('/markAbsent', adminMiddleware, async (req, res) => {
  try {
    await attendanceController.markAbsentForAll(req.body.sessionId);
    res.status(200).json({ success: true, message: 'Absentees marked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🧠 Redundant endpoint for flexibility (Optional)
attendanceRouter.post('/mark', userMiddleware, async (req, res) => {
  const userId = req.result._id;
  const { otp, sessionId } = req.body;

  const result = await attendanceController.submitOtp(userId, otp, sessionId);
  res.status(result.success ? 200 : 400).json({ message: result.message });
});

// 🔍 Check if an active session is running
attendanceRouter.get('/check-active', async (req, res) => {
  return attendanceController.checkactive(req, res);
});
attendanceRouter.get('/live-attendees', userMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const startOfToday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));

    const endOfToday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    const liveAttendance = await Attendance.find({
      date: { $gte: startOfToday, $lte: endOfToday },
    }).populate('user', 'firstName emailId');

    res.status(200).json({
      success: true,
      date: startOfToday.toISOString().split('T')[0],
      attendees: liveAttendance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
});

module.exports = attendanceRouter;
