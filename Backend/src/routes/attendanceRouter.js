const express = require('express');
const attendanceRouter = express.Router();
const { sendOtpToUser, verifyOtpAndMarkAttendance } = require('../controllers/attendanceController');
const userMiddleware = require('../middleware/userMiddleware'); // Checks JWT authentication
const adminMiddleware = require('../middleware/adminMiddleware'); // Checks admin role

//--------------------------------------------
// ✅ Routes for Attendance Management
//--------------------------------------------

// Only admin can send OTP to a user
attendanceRouter.post('/send-otp', adminMiddleware, sendOtpToUser);

// User verifies OTP to mark attendance
attendanceRouter.post('/verify-otp', userMiddleware, verifyOtpAndMarkAttendance);

// User fetches their attendance history
attendanceRouter.get('/history', userMiddleware, async (req, res, next) => {
    try {
        const { userId } = req.user; // Extracted from JWT middleware
        const user = await User.findById(userId).select('attendance');
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user.attendance);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
attendanceRouter.use((error, req, res, next) => {
    console.error(error.stack);
    res.status(500).json({ message: "Internal server error", error: error.message });
});

module.exports = attendanceRouter;