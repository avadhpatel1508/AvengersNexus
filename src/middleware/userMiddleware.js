const jwt = require("jsonwebtoken")
const User = require("../models/user")
const redisClient = require("../config/redish")


const userMiddleware = async(req,res,next)=>{

    try{
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present")

        const payload =  jwt.verify(token,process.env.JWT_KEY);

        const {_id} = payload;

        if(!_id)
            throw new Error("Invalid token") 

        const result= await User.findById(_id)

        if(!result)
            throw new Error("User Doesn't exist")

        //Redish ke blocklist mai to present nai hai

        const isBlocked = await redisClient.exists(`token:${token}`);

        if(isBlocked)
            throw new Error("Invalid Token")

        req.result = result;

        next();
    }
    catch(error){
        res.status(401).send("Error is: "+error)
    }
}

module.exports = userMiddleware

//  "emailId":"avadhnandasana14@gmail.com",
//     "passWord":"Avadh@patel123"