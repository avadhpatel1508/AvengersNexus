const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  mission: {
    type: Schema.Types.ObjectId,
    ref: 'mission',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  stripeSessionId: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },
  paidAt: {
    type: Date,
  }
}, { timestamps: true });

const Payment = mongoose.model('payment', paymentSchema);

module.exports = Payment;
