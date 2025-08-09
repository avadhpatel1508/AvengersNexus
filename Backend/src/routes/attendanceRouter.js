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

attendanceRouter.get('/days-present', userMiddleware, async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    // Validate date inputs
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    // Adjust end date to include the full day
    const startOfDay = new Date(start.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(end.setUTCHours(23, 59, 59, 999));

    // Check user permissions
    if (userId && req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Build query
    const query = {
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'Present',
    };
    if (userId) {
      query.user = userId;
    }

    // MongoDB aggregation to count days present
    const aggregation = [
      { $match: query },
      {
        $group: {
          _id: userId ? null : '$user',
          daysPresent: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          userId: userId ? null : '$user._id',
          userName: userId ? null : '$user.firstName',
          daysPresent: 1,
        },
      },
    ];

    const result = await Attendance.aggregate(aggregation);

    // Format response
    if (userId) {
      const daysPresent = result.length > 0 ? result[0].daysPresent : 0;
      return res.status(200).json({
        success: true,
        userId,
        daysPresent,
      });
    }

    const formattedResult = result.map((entry) => ({
      userId: entry.userId,
      userName: entry.userName || 'Unknown',
      daysPresent: entry.daysPresent,
    }));

    res.status(200).json({
      success: true,
      startDate,
      endDate,
      daysPresent: formattedResult,
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