const express = require('express')
const app = express();
require("dotenv").config();
const main = require("./config/db")
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/userAuth");
const redisClient = require('./config/redish');
const missionRouter = require("./routes/missionAuth")
const postRouter = require("./routes/postAuth");
const attendanceRouter = require('./routes/attendanceRouter');


const cors = require('cors');

app.use(cors({
    origin:process.env.FRONT_END_KEY,
    credentials:true
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user',authRouter)
app.use('/mission', missionRouter)
app.use('/post', postRouter)
app.use('/attendance', attendanceRouter);



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
        console.log("Error occured")
    }
}


InitializeConnection();