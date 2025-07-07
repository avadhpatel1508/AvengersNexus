const mongoose = require('mongoose')
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowecase:true,
        immutable:true
    },
    passWord:{
        type:String,
        required:true,
        
    },
    age:{
        type:Number,
        min:10,
        max:50
    },
    role:{
        type:String,
        enum:['user', 'admin'],
        default:'user'
    },
    missionCompleted:{
        type:[{
            type: Schema.Types.ObjectId,
            ref:'mission'
        }],
        unique:true
    }

},{
    timestamps:true
})

const User  = mongoose.model("user", userSchema);
module.exports = User