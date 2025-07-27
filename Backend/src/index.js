const express = require('express');
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const redisClient = require('./config/redish');
const cors = require('cors');

const authRouter = require("./routes/userAuth");
const missionRouter = require("./routes/missionAuth");
const postRouter = require("./routes/postAuth");
const attendanceRouter = require('./routes/attendanceRouter');

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

app.set('io', io); // Make io accessible in routes

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/mission', missionRouter);
app.use('/post', postRouter);
app.use('/attendance', attendanceRouter);
app.use(express.json());
require('./socket/attendanceSocket')(io);

const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB and Redis connected");

    server.listen(process.env.PORT, () => {
      console.log("Server listening at port number: " + process.env.PORT);
    });
  } catch (err) {
    console.log("Initialization error:", err);
  }
};

InitializeConnection();
