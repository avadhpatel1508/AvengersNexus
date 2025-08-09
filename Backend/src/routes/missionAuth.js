const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require("../middleware/userMiddleware");

const {
  CreateMission,
  UpdateMission,
  DeleteMission,
  getMissionById,
  getAllMission,
  getCompletedMissionsByUser,
  completeMissionById,
  getRewardsByUser,
  getUserMissionStats,
  getAdminPaymentHistory
} = require('../controllers/userMission');

module.exports = (io) => {
  const missionRouter = express.Router();

  // Admin routes
  missionRouter.post('/create', adminMiddleware, CreateMission(io));
  missionRouter.patch('/:id', adminMiddleware, UpdateMission);
  missionRouter.delete('/:id', adminMiddleware, DeleteMission);

  // Complete mission route (admin only)
  missionRouter.patch('/complete/:id', adminMiddleware, completeMissionById);

  // User + Admin routes
  missionRouter.get('/getAllMission', userMiddleware, getAllMission);
  missionRouter.get('/missionCompletedByUser', userMiddleware, getCompletedMissionsByUser);

  // Dynamic routes
  missionRouter.get('/getRewardsByUser/:userId', userMiddleware, getRewardsByUser);
  missionRouter.get('/missionStats/:userId', userMiddleware, getUserMissionStats);
  missionRouter.get('/:id', userMiddleware, getMissionById);
  missionRouter.get('/adminpayment', adminMiddleware, getAdminPaymentHistory);


  return missionRouter;
};