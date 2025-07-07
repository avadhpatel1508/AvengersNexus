const express = require('express')
const app = express();
require("dotenv").config();
const main = require("./config/db")
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redish');
const missionRouter = require("./routes/missionAuth")
const postRouter = require("../src/routes/postAuth");
const submitRouter = require("../src/routes/submitAuth")

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter)
app.use('/mission', missionRouter)
app.use('/post', postRouter)
app.use('/submission', submitRouter)


const InitializeConnection = async()=>{
    try{
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB connected");
        app.listen(process.env.PORT, ()=>{
            console.log("Server listening at port number: "+process.env.PORT)
    })
    }
    catch(err){
        console.log("Eror is: "+err)
    }
}


InitializeConnection();