const express = require('express');
const missionRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require("../middleware/userMiddleware");
const { CreateMission, UpdateMission, DeleteMission, getMissionById, getAllMission, getCompletedMissionsByUser } = require('../controllers/userMission');

// Admin routes
missionRouter.post('/create', adminMiddleware, CreateMission);
missionRouter.patch('/:id', adminMiddleware, UpdateMission);
missionRouter.delete('/:id', adminMiddleware, DeleteMission);

// User + Admin routes (more specific ones first)
missionRouter.get('/getAllMission', userMiddleware, getAllMission);
missionRouter.get('/missionCompletedByUser', userMiddleware, getCompletedMissionsByUser);

// Dynamic route should be last
missionRouter.get('/:id', userMiddleware, getMissionById);

module.exports = missionRouter;
