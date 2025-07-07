const express = require('express');
const missionRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware')
const { CreateMission, UpdateMission, DeleteMission, getMissionById, getAllMission} = require('../controllers/userMission');

//Create
//admin
missionRouter.post('/create',adminMiddleware, CreateMission);
missionRouter.patch('/:id',adminMiddleware, UpdateMission);
missionRouter.delete('/:id',adminMiddleware, DeleteMission);
//user as well as admin
missionRouter.get('/:id', getMissionById);
missionRouter.get('/', getAllMission);



module.exports = missionRouter;

//fetch
//update
//delete