import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import connectDB from './config/db'; // Comment out for now
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to MongoDB - commented out for testing
// connectDB();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NeighBridge API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint for user registration without Firebase
app.post('/api/test/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test registration endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
