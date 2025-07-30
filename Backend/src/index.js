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

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// 🔁 Load socket handlers
require('./socket/attendanceSocket')(io);
require('./socket/chatSocket')(io);

// 🌐 Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 🔌 Attach io to app for access in routers (optional)
app.set('io', io);

// 🌐 Routes
const authRouter = require("./routes/userAuth");
const postRouter = require("./routes/postAuth");
const attendanceRouter = require('./routes/attendanceRouter');
const feedbackRouter = require('./routes/feedbackRoutes');
const chatRouter = require('./routes/chatRoutes');

// ✅ Import missionRouter only after io is ready
const missionRouter = require("./routes/missionAuth")(io); // <-- io passed here

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
