// ...existing code...
// ...existing code...
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import userRoutes from './modules/users/user.routes';
import communityRoutes from './modules/communities/community.routes';
import eventRoutes from './modules/events/event.routes';
import issueRoutes from './modules/issue/Issue.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to MongoDB (non-blocking)
connectDB().catch(console.error);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
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

// API routes
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/issues', issueRoutes);

// Test route for quick testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: {
      mongoConnected: process.env.MONGO_URI ? 'Configured' : 'Not configured'
    }
  });
});

// 404 handler
import postRoutes from './modules/posts/post.routes';
app.use('/api/posts', postRoutes);
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
