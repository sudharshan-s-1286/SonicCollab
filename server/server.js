import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import connectDB, { isDbConnected } from './src/config/db.js';
import { notFound, errorHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import trackRoutes from './src/routes/track.routes.js';
import commentRoutes from './src/routes/comment.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import userRoutes from './src/routes/user.routes.js';
import invitationRoutes from './src/routes/invitation.routes.js';

dotenv.config();

// Connect to database
connectDB();

const app = express();

const debugLog = (payload) => {
  // #region agent log
  fetch('http://127.0.0.1:7589/ingest/777e9d3e-cab0-4b34-b6ce-3f2388863c0f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0bff56' },
    body: JSON.stringify({
      sessionId: '0bff56',
      runId: payload.runId || 'pre-fix',
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Keep API responsive even when MongoDB is down.
let lastDb503LogAt = 0;
app.use('/api', (req, res, next) => {
  if (!isDbConnected()) {
    const now = Date.now();
    if (now - lastDb503LogAt > 2000) {
      lastDb503LogAt = now;
      debugLog({
        hypothesisId: 'H4',
        location: 'server/server.js:/api_guard',
        message: 'Blocking API request because DB not connected',
        data: { method: req.method, path: req.originalUrl },
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please try again in a moment.',
    });
  }
  return next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invites', invitationRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/search', searchRoutes);

// General route
app.get('/', (req, res) => {
  res.send('SonicCollab API is running...');
});

// Error handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
