const express = require('express');
const missionRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware')
const { CreateMission, UpdateMission, DeleteMission, getMissionById, getAllMission, completedMissionByUser, markMissionComplete} = require('../controllers/userMission');

//Create
//admin
missionRouter.post('/create',adminMiddleware, CreateMission);
missionRouter.patch('/:id',adminMiddleware, UpdateMission);
missionRouter.delete('/:ipd',adminMiddleware, DeleteMission);
missionRouter.patch('/complete/:id', adminMiddleware, markMissionComplete);
//user as well as admin
missionRouter.get('/:id', getMissionById);
missionRouter.get('/', getAllMission);
missionRouter.get('/user', completedMissionByUser);


module.exports = missionRouter;

//fetch
//update
//delete