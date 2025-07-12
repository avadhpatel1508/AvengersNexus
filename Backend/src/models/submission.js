const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        require:true
    },
    missionId:{
        type: Schema.Types.ObjectId,
        ref:'Mission',
        require:true
    },
    status:{
        type: String,
        enum:['completed', 'pending'],
        default: 'pending'
    }
},{
    timestamps:true
});

const Submission =  mongoose.model('submission', submissionSchema);

module.exports = Submission;