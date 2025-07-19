const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Mission = require('../models/mission');
const User = require('../models/user');
const Payment = require('../models/payment');

exports.handleMissionPayment = async (req, res) => {
  const { missionId } = req.params;

  try {
    const mission = await Mission.findById(missionId).populate('avengersAssigned');
    if (!mission) return res.status(404).json({ message: 'Mission not found' });

    if (mission.isCompleted) return res.status(400).json({ message: 'Mission already completed' });

    // Mark mission as complete
    mission.isCompleted = true;
    await mission.save();

    // Process payment to each user
    const paymentResults = [];

    for (const user of mission.avengersAssigned) {
      // Create a Stripe PaymentIntent (normally you’d use Stripe Connect for payouts)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // Example: ₹50.00
        currency: 'inr',
        payment_method_types: ['card'],
        description: `Payment for mission ${mission.title} to ${user.firstName}`,
        receipt_email: user.emailId,
      });

      // Store in DB
      const paymentRecord = new Payment({
        userId: user._id,
        missionId: mission._id,
        amount: 5000,
        currency: 'INR',
        status: 'PENDING', // You can update this later on confirmation
        paymentIntentId: paymentIntent.id,
      });

      await paymentRecord.save();
      paymentResults.push(paymentRecord);
    }

    res.status(200).json({
      message: 'Mission marked as complete. Payment initiated.',
      payments: paymentResults,
    });
  } catch (err) {
    console.error('Payment Error:', err);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
};
