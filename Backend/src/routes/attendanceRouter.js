const express = require('express');
const attendanceRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const Attendance = require('../models/attendance');
const { startAttendance, submitOtp, markAbsentForAll } = require('../controllers/attendanceController');
const attendanceController  = require('../controllers/attendanceController')
attendanceRouter.get('/date/:date', adminMiddleware, async (req, res) => {
  try {
    const formattedDate = new Date(req.params.date).toISOString().split('T')[0];
    const attendance = await Attendance.find({ date: formattedDate }).populate('user', 'firstName emailId');
    res.status(200).json({ success: true, date: formattedDate, attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

attendanceRouter.get('/user/:userId', userMiddleware, async (req, res) => {
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

attendanceRouter.post('/start', adminMiddleware, async (req, res) => {
  try {
    const result = await startAttendance(req.app.get('io'), req.result._id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

attendanceRouter.post('/submit', userMiddleware, async (req, res) => {
  const { enteredOtp, sessionId } = req.body;
  const result = await submitOtp(req.result._id, enteredOtp, sessionId);
  res.status(result.success ? 200 : 400).json(result);
});

attendanceRouter.post('/markAbsent', adminMiddleware, async (req, res) => {
  try {
    await markAbsentForAll(req.body.sessionId);
    res.status(200).json({ success: true, message: 'Absentees marked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
attendanceRouter.post('/mark', async (req, res) => {
  const userId = req.user._id;
  const { otp, sessionId } = req.body;

  const result = await attendanceController.submitOtp(userId, otp, sessionId);
  if (result.success) {
    return res.status(200).json({ message: result.message });
  } else {
    return res.status(400).json({ message: result.message });
  }
});

module.exports = attendanceRouter;