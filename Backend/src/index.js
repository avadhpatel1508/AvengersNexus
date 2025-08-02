const express = require('express');
const app = express();
require("dotenv").config();

const cookieParser = require("cookie-parser");
const redisClient = require('./config/redish');
const cors = require('cors');
const main = require("./config/db");

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

// ✅ Read allowed origins from .env
const allowedOrigins = process.env.FRONT_KEY?.split(',') || ['http://localhost:5173'];

// ✅ Dynamic CORS function
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
};

// 🔌 Socket.IO server setup
const io = new Server(server, {
  cors: corsOptions,
});

// 🔁 Load socket handlers
require('./socket/attendanceSocket')(io);
require('./socket/chatSocket')(io);

// 🌐 Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 🔌 Attach io to app (optional use in routers)
app.set('io', io);

// 🌐 Routes
const authRouter = require("./routes/userAuth");
const postRouter = require("./routes/postAuth");
const attendanceRouter = require('./routes/attendanceRouter');
const feedbackRouter = require('./routes/feedbackRoutes');
const chatRouter = require('./routes/chatRoutes');
const missionRouter = require("./routes/missionAuth")(io); // router needs io

app.use('/user', authRouter);
app.use('/mission', missionRouter);
app.use('/post', postRouter);
app.use('/attendance', attendanceRouter);
app.use('/feedback', feedbackRouter);
app.use('/chat', chatRouter);

// 🚀 Server Start
const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("✅ DB and Redis connected");

    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server listening on port: ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("❌ Initialization error:", err);
  }
};

InitializeConnection();
