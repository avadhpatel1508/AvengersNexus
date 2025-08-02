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

// ✅ Setup CORS with a single allowed origin from .env
const allowedOrigins = process.env.FRONT_KEY?.split(',') || ['http://localhost:5173'];
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

// ✅ Setup Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

// ✅ Attach custom socket logic
require('./socket/attendanceSocket')(io);
require('./socket/chatSocket')(io);

// ✅ Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Attach io to app for router access
app.set('io', io);

// ✅ Health check route (fixes "Cannot GET /")
app.get('/', (req, res) => {
  res.send('✅ Avengers Nexus backend is running.');
});

// ✅ Load and use routes
const authRouter = require('./routes/userAuth');
const postRouter = require('./routes/postAuth');
const attendanceRouter = require('./routes/attendanceRouter');
const feedbackRouter = require('./routes/feedbackRoutes');
const chatRouter = require('./routes/chatRoutes');
const missionRouter = require('./routes/missionAuth')(io); // pass io if needed in router

app.use('/user', authRouter);
app.use('/mission', missionRouter);
app.use('/post', postRouter);
app.use('/attendance', attendanceRouter);
app.use('/feedback', feedbackRouter);
app.use('/chat', chatRouter);

// ✅ Connect DB, Redis, then start server
const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log('✅ MongoDB and Redis connected');

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port: ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Initialization error:', err);
  }
};

// ✅ Graceful shutdown for Redis
process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('🛑 Redis disconnected');
  process.exit(0);
});

InitializeConnection();
