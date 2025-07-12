const jwt = require("jsonwebtoken")
const User = require("../models/user")
const redisClient = require("../config/redish")


const adminMiddleware = async(req,res,next)=>{

    try{
        const {token} = req.cookies;
        if(!token)
            throw new Error("Token is not present")

        const payload =  jwt.verify(token,process.env.JWT_KEY);

        const {_id,role} = payload;

        if (!role || role !== 'admin') throw new Error("Access denied: Admins only");
        const isblocked = await redisClient.exists(`token:${token}`);
        if (isblocked) throw new Error("Invalid Token");

        const result= await User.findById(_id)

        if(!result)
            throw new Error("User Doesn't exist")

        //Redish ke blocklist mai to present nai hai

       

        req.result = result;

        next();
    }
    catch(error){
        res.status(401).send("Error is: "+error)
    }
}

module.exports = adminMiddleware