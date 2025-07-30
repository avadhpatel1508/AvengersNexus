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
  getRewardsByUser
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

  // Dynamic routes should be last
  missionRouter.get('/getRewardsByUser/:userId', getRewardsByUser);
  missionRouter.get('/:id', userMiddleware, getMissionById);

  return missionRouter;
};
