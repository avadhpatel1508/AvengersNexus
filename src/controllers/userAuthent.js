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

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        }
        res.cookie('token', token, {maxAge:60*60*1000*7*24})
        res.status(201).json({
            user:reply,
            message: "Register successfully"
        })
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

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id
        }

        const token =  jwt.sign({_id:user._id , emailId:emailId, role: user.role},process.env.JWT_KEY,{expiresIn:'7d'});
        res.cookie('token',token,{maxAge: 7 * 24 * 60 * 60*1000});
        res.status(200).json({
            user:reply,
            message:"Login successfully"
        })
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

const deleteProfile = async(req,res)=>{

    try{
        const userId = req.result._id

        await User.findByIdAndDelete(userId)
        res.status(200).send("Profile delete successfully")
    }
    catch(err){
        res.status(500).sned("Internal server error")
    }
}

module.exports = {register, login, logout , adminRegister, deleteProfile};