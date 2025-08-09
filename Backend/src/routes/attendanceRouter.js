const express = require('express');
const attendanceRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const Attendance = require('../models/attendance');
const attendanceController = require('../controllers/attendanceController');

attendanceRouter.get('/date/:date', userMiddleware, async (req, res) => {
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
});

attendanceRouter.get('/:userId', userMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const attendance = await Attendance.find({ user: userId }).sort({ date: -1 });
    res.status(200).json({ success: true, userId, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

attendanceRouter.post('/start', adminMiddleware, async (req, res) => {
  try {
    const result = await attendanceController.startAttendance(req.app.get('io'), req.result._id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

attendanceRouter.post('/submit', userMiddleware, async (req, res) => {
  const { enteredOtp, sessionId } = req.body;
  const result = await attendanceController.submitOtp(req.result._id, enteredOtp, sessionId);
  res.status(result.success ? 200 : 400).json(result);
});

attendanceRouter.post('/markAbsent', adminMiddleware, async (req, res) => {
  try {
    await attendanceController.markAbsentForAll(req.body.sessionId);
    res.status(200).json({ success: true, message: 'Absentees marked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

attendanceRouter.post('/mark', userMiddleware, async (req, res) => {
  const userId = req.result._id;
  const { otp, sessionId } = req.body;

  const result = await attendanceController.submitOtp(userId, otp, sessionId);
  res.status(result.success ? 200 : 400).json({ message: result.message });
});

attendanceRouter.get('/check-active', async (req, res) => {
  return attendanceController.checkactive(req, res);
});
attendanceRouter.get('/monthlysummary', userMiddleware, attendanceController.getMonthlySummary);
module.exports = attendanceRouter;
