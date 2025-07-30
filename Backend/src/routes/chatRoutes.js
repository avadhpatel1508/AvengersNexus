// routes/chatRoutes.js

const express = require('express');
const chatRouter = express.Router();
const chatController = require('../controllers/chatController');
const {getMessagesByMission, getUserChats} = require('../controllers/chatController');
const userMiddleware = require('../middleware/userMiddleware');

// GET messages for a mission
chatRouter.get('/message/:missionId', userMiddleware,getMessagesByMission);
chatRouter.get('/groups', userMiddleware, getUserChats);


module.exports = chatRouter;
