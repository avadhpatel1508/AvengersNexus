const express = require('express');
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, getAllUsers, getUserById , SendOtpSignup , VerifyOtpSignup} = require("../controllers/userAuthent");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User  = require('../models/user');
// Register
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/admin/register', adminMiddleware, adminRegister);
authRouter.delete('/deleteProfile', userMiddleware, deleteProfile);
authRouter.get('/check', userMiddleware, (req, res) => {
    const reply = {
        firstName: req.user.firstName,
        emailId: req.user.emailId,
        _id: req.user._id,
        role: req.user.role
    };
    res.status(200).json({
        user: reply,
        message: "Valid User"
    });
});
authRouter.get('/users', getAllUsers);
authRouter.get('/getUser/:id', getUserById)
authRouter.post('/send-otp', SendOtpSignup);
authRouter.post('/verify-otp', VerifyOtpSignup);
authRouter.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })  // exclude admins
      .select('firstName lastName emailId exp totalReward missionCompleted') // added lastName, emailId for full details
      .sort({ exp: -1 })
      .lean();

    res.status(200).json({ users });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
  }
});


module.exports = authRouter;