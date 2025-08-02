const express = require('express');
const app = express();
require('dotenv').config();

const cookieParser = require('cookie-parser');
const redisClient = require('./config/redish');
const cors = require('cors');
const helmet = require('helmet');
const main = require('./config/db');

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);

// ✅ Setup CORS with support for Vercel + localhost
const allowedOrigins = process.env.FRONT_KEY?.split(',') || ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    try {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(new URL(origin).origin)) {
        callback(null, true);
      } else {
        console.error('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS: ' + origin));
      }
    } catch (err) {
      console.error('❌ Invalid Origin:', origin);
      callback(new Error('CORS origin error'));
    }
  },
  credentials: true,
};

// ✅ Setup Socket.IO with same CORS options
const io = new Server(server, {
  cors: corsOptions,
});

// ✅ Attach socket handlers
require('./socket/attendanceSocket')(io);
require('./socket/chatSocket')(io);

// ✅ Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Attach io to app if needed in routes
app.set('io', io);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Avengers Nexus backend is running.');
});

// ✅ Load and use routes
const authRouter = require('./routes/userAuth');
const postRouter = require('./routes/postAuth');
const attendanceRouter = require('./routes/attendanceRouter');
const feedbackRouter = require('./routes/feedbackRoutes');
const chatRouter = require('./routes/chatRoutes');
const missionRouter = require('./routes/missionAuth')(io); // if it uses socket

app.use('/user', authRouter);
app.use('/mission', missionRouter);
app.use('/post', postRouter);
app.use('/attendance', attendanceRouter);
app.use('/feedback', feedbackRouter);
app.use('/chat', chatRouter);

// ✅ Start Server after DB & Redis
const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log('MongoDB and Redis connected');

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`Server listening on port: ${PORT}`);
    });
  } catch (err) {
    console.error('Initialization error:', err);
  }
};

// ✅ Graceful Redis shutdown
process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Redis disconnected');
  process.exit(0);
});

InitializeConnection();
