import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenses.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or serverless proxies)
      if (!origin) return callback(null, true);
      // In development allow local origins
      if (
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin === CLIENT_URL ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/expenses', expenseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected (using fallback)';
  res.status(200).json({
    status: 'ok',
    database: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.send('ExpenseFlow API is running smoothly.');
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas successfully.');
    })
    .catch((err) => {
      console.warn('⚠️ MongoDB connection warning:', err.message);
      console.log('⚡ Running with responsive in-memory fallback store.');
    });
} else {
  console.log('ℹ️ No MONGO_URI provided in environment. Using in-memory store for instant demonstration.');
}

// Start standalone server if run directly
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 ExpenseFlow server listening on port ${PORT}`);
  });
}

export default app;
