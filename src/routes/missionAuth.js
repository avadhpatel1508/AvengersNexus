const express = require('express');
const missionRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware')
const userMiddleware = require("../middleware/userMiddleware")
const { CreateMission, UpdateMission, DeleteMission, getMissionById, getAllMission, getCompletedMissionsByUser } = require('../controllers/userMission');

//Create
//admin
missionRouter.post('/create',adminMiddleware, CreateMission);
missionRouter.patch('/:id',adminMiddleware, UpdateMission);
missionRouter.delete('/:id',adminMiddleware, DeleteMission);
//user as well as admin
missionRouter.get('/:id', userMiddleware, getMissionById);
missionRouter.get('/',userMiddleware, getAllMission);
missionRouter.get('/completed-missions', userMiddleware, getCompletedMissionsByUser);



module.exports = missionRouter;

//fetch
//update
//delete