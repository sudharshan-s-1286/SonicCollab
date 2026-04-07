import mongoose from 'mongoose';

const RETRY_DELAY_MS = 5000;
let reconnectTimer = null;

const debugLog = (payload) => {
  // #region agent log
  fetch('http://127.0.0.1:7589/ingest/777e9d3e-cab0-4b34-b6ce-3f2388863c0f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0bff56' },
    body: JSON.stringify({
      sessionId: '0bff56',
      runId: 'pre-fix',
      hypothesisId: payload.hypothesisId,
      location: payload.location,
      message: payload.message,
      data: payload.data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
};

const scheduleReconnect = () => {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    await connectDB();
  }, RETRY_DELAY_MS);
};

const connectDB = async () => {
  try {
    // Disable command buffering so request handlers fail fast when DB is unavailable.
    mongoose.set('bufferCommands', false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    debugLog({
      hypothesisId: 'H1',
      location: 'server/src/config/db.js:connectDB',
      message: 'MongoDB connected',
      data: { readyState: mongoose.connection.readyState, host: conn.connection.host },
    });

    mongoose.connection.on('disconnected', () => {
      console.error('MongoDB disconnected. Retrying connection...');
      debugLog({
        hypothesisId: 'H2',
        location: 'server/src/config/db.js:disconnected',
        message: 'MongoDB disconnected',
        data: { readyState: mongoose.connection.readyState },
      });
      scheduleReconnect();
    });

    mongoose.connection.on('error', (error) => {
      console.error(`MongoDB error: ${error.message}`);
      debugLog({
        hypothesisId: 'H3',
        location: 'server/src/config/db.js:connection_error',
        message: 'MongoDB connection error event',
        data: { name: error?.name, message: String(error?.message || '').slice(0, 200) },
      });
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    debugLog({
      hypothesisId: 'H1',
      location: 'server/src/config/db.js:connectDB_catch',
      message: 'MongoDB connect failed (will retry)',
      data: {
        readyState: mongoose.connection.readyState,
        name: error?.name,
        message: String(error?.message || '').slice(0, 200),
      },
    });
    scheduleReconnect();
  }
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

export default connectDB;
