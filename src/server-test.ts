// Simple test to get the server running
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'NeighBridge API is running',
    timestamp: new Date().toISOString()
  });
});

// Test registration route (simplified)
app.post('/api/users/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Registration endpoint working',
    data: req.body
  });
});

// Test login route (simplified)
app.post('/api/users/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Login endpoint working',
    data: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 NeighBridge Test Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
💡 Health Check: http://localhost:${PORT}/health
🔥 Test Register: POST http://localhost:${PORT}/api/users/register
🔥 Test Login: POST http://localhost:${PORT}/api/users/login
  `);
});

export default app;
