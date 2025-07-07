const User = require("../models/user")
const validator = require("validator")

const validate = (data)=>{
        const mandatoryfields = ['firstName', "emailId", "passWord" ];

        const isAllowed = mandatoryfields.every((k)=>Object.keys(data).includes(k));

        if(!isAllowed)
            throw new Error("Some Field is missing")
        if(!validator.isEmail(data.emailId))
            throw new Error("Invalid Email")
        if(!validator.isStrongPassword(data.passWord))
            throw new Error("Weak Password")
}
module.exports = validate;