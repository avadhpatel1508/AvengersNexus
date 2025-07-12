const express  = require('express');
const submitRouter = express.Router()
const userMiddleware=  require("../middleware/userMiddleware");
const submitMission = require('../controllers/userSubmission');

submitRouter.post('/submit/id', userMiddleware, submitMission)

module.exports = submitRouter