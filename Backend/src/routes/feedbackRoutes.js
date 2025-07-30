// feedbackRoutes.js (VALID ✅)
const express = require('express');
const { sendFeedback, getAllFeedbacks, markFeedbackAsSeen } = require('../controllers/feedbackController.js');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

const feedbackRouter = express.Router();

feedbackRouter.post('/feedback', userMiddleware, sendFeedback);
feedbackRouter.get('/getall', adminMiddleware, getAllFeedbacks);
feedbackRouter.delete('/delete/:id', adminMiddleware, markFeedbackAsSeen);

module.exports = feedbackRouter;
