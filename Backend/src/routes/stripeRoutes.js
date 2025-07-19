const express = require('express');
const StripeRouter = express.Router();
const { handleMissionPayment } = require('../controllers/stripeController');
const adminMiddleware = require('../middleware/adminMiddleware');

// Route to handle mission payment (when admin marks mission complete)
StripeRouter.post('/pay-mission/:missionId', adminMiddleware, handleMissionPayment);

module.exports = StripeRouter;
