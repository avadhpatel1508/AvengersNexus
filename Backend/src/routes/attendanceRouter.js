const express = require('express');
const attendanceRouter = express.Router();
const { startAttendance, submitAttendance } = require('../controllers/attendanceController');
const userMiddleware  = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Protect with admin middleware if needed
attendanceRouter.post('/start', adminMiddleware, startAttendance);
attendanceRouter.post('/submit',userMiddleware, submitAttendance);

module.exports = attendanceRouter;
