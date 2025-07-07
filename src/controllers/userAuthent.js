const redisClient = require("../config/redish");
const User = require("../models/user")
const validate = require("../utils/validator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const register = async  (req,res)=>{
    try{
        validate(req.body)
        const {firstName, emailId, passWord} = req.body;

        req.body.passWord = await bcrypt.hash(passWord,10)
        
        const user = await User.create(req.body)
       const token = jwt.sign({ _id: user._id, emailId: user.emailId,role: user.role },process.env.JWT_KEY,{ expiresIn: 60 * 60 * 1000});

        res.cookie('token', token, {maxAge:60*60*1000*7*24})
        res.status(201).send("User registered successfully")
    }
    catch(err){
        res.status(400).send("Error: ", +err)
    }
}


const login = async (req,res)=>{

    try{
        const {emailId, passWord} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!passWord)
            throw new Error("Invalid Credentials");

        const user = await User.findOne({emailId});

        const match = bcrypt.compare(passWord,user.passWord);

        if(!match)
            throw new Error("Invalid Credentials");

        const token =  jwt.sign({_id:user._id , emailId:emailId, role: user.role},process.env.JWT_KEY,{expiresIn:  7 * 24 * 60 * 60});
        res.cookie('token',token,{maxAge: 7 * 24 * 60 * 60*1000});
        res.status(200).send("Logged In Succeessfully" , user);
    }
    catch(err){
        res.status(401).send("Error: "+err);
    }
}

//LogOut Features
const logout  = async(req,res)=>{
    try{
        //validate the token
        const {token} = req.cookies;
        const payload = jwt.decode(token)


        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`,payload.exp)
        //token add kar dunga Redis ke blocklist me
        // cookies ko clear kar 
        
        res.cookie("token", null,{expires:  new Date(Date.now())});
        res.send("Logout Succesfully")
    }
    catch(err){
        res.status(401).send("Error is: "+err)
    }
}

//Admin Register
const adminRegister = async(req,res)=>{
    try{
        //validate data
        validate(req.body)
        const {firstName, emailId, passWord} = req.body;

        //ye emailId already exist toh nai kar rahi
        req.body.passWord = await bcrypt.hash(passWord,10)
        // req.body.role = "admin"

        const user = await User.create(req.body)
        const token = jwt.sign({_id: user._id, emailId: emailId, role:user.role},process.env.JWT_KEY, {expiresIn:60*60})
        res.cookie('token', token, {maxAge:60*60*1000})
        res.status(201).send("Admin registered successfully")
    }
    catch(err){
        res.status(400).send("Error: "+err)
    }
}

module.exports = {register, login, logout , adminRegister};