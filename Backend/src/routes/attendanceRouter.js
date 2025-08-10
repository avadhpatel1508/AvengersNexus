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



attendanceRouter.get('/percentage/:userId', userMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    // Authorization: user can only access own data or admin can access any
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Validate month/year
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (
      isNaN(monthNum) ||
      monthNum < 1 ||
      monthNum > 12 ||
      isNaN(yearNum) ||
      yearNum < 2000
    ) {
      return res.status(400).json({ success: false, message: 'Invalid month or year' });
    }

    // Calculate start and end dates of the month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // last day of month

    // Fetch attendance records for user in that month
    const attendanceRecords = await Attendance.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    });

    // Define total expected attendance days in this month
    // (You can change this logic as needed)
    // Example: count weekdays (Mon-Fri) in the month
    const countWeekdays = (year, month) => {
      let count = 0;
      const date = new Date(year, month - 1, 1);
      while (date.getMonth() === month - 1) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) count++; // Mon-Fri
        date.setDate(date.getDate() + 1);
      }
      return count;
    };
    const totalExpectedDays = countWeekdays(yearNum, monthNum);

    // Count present days (assuming status 'present' means attended)
    const presentDays = attendanceRecords.filter(
      (record) => record.status.toLowerCase() === 'present'
    ).length;

    // Calculate attendance percentage
    const percentage = totalExpectedDays
      ? (presentDays / totalExpectedDays) * 100
      : 0;

    res.status(200).json({
      success: true,
      userId,
      month: monthNum,
      year: yearNum,
      totalExpectedDays,
      presentDays,
      attendancePercentage: percentage.toFixed(2),
    });
  } catch (err) {
    console.error('Error calculating attendance percentage:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = attendanceRouter;