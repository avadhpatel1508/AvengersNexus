const express = require('express');
const missionRouter = express.Router();
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

// Admin routes
missionRouter.post('/create', adminMiddleware, CreateMission);
missionRouter.patch('/:id', adminMiddleware, UpdateMission);
missionRouter.delete('/:id', adminMiddleware, DeleteMission);

// Complete mission route (admin only)
missionRouter.patch('/complete/:id', adminMiddleware, completeMissionById);

// User + Admin routes
missionRouter.get('/getAllMission', userMiddleware, getAllMission);
missionRouter.get('/missionCompletedByUser', userMiddleware, getCompletedMissionsByUser);

// Dynamic route should be last
missionRouter.get('/:id', userMiddleware, getMissionById);
missionRouter.get('/getRewardsByUser/:userId', getRewardsByUser )
module.exports = missionRouter;
