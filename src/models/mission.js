const mongoose = require("mongoose");
const { Schema } = mongoose;

const missionSchema = new Schema({
    title: {
        type: String,
        required: true  // Changed from 'require' to 'required'
    },
    description: {
        type: String,
        minLength: 10,
        maxLength: 100,
        required: true  // Changed from 'require' to 'required'
    },
    Location: {
        type: String,
        required: true,  // Changed from 'require' to 'required'
        minLength: 2,
        maxLength: 15
    },
    avengersAssigned: [{
        type: Schema.Types.ObjectId,
        ref: "user",
        validate: {
        validator: function(v) {
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
        required: true  // Changed from 'require' to 'required'
    },
     isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: Schema.Types.ObjectId,
    ref: "user",
    default: null
  }
});

const Mission = mongoose.model('mission', missionSchema);

module.exports = Mission;