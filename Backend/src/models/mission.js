const mongoose = require("mongoose");
const { Schema } = mongoose;

const missionSchema = new Schema({
  title: {
    type: String,
    required: true 
  },
  description: {
    type: String,
    minLength: 50,
    maxLength: 300,
    required: true
  },
  Location: {
    type: String,
    required: true,  
    minLength: 2,
    maxLength: 15
  },
  avengersAssigned: [{
    type: Schema.Types.ObjectId,
    ref: "user",
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: props => `${props.value} is not a valid user ID!`
    } 
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  amount: {
    type: Number,
    required: true
  },
  paymentInfo: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },
      amount: Number,
      
      paymentIntentId: String, // Stripe transfer ID
      status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed'],
        default: 'pending'
      },
      paidAt: Date
    }
  ],
  paymentHistory: [
    {
      missionId: { type: Schema.Types.ObjectId, ref: 'mission' },
      amount: Number,
      transferId: String,
      paidAt: Date,
      status: { type: String, enum: ['succeeded', 'failed'] }
    }
  ]
});

const Mission = mongoose.model('mission', missionSchema);
module.exports = Mission;
