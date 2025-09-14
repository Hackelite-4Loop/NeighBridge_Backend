import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "neighbridge",
      // Connection timeouts
      serverSelectionTimeoutMS: 30000, // Increased from 10s to 30s
      connectTimeoutMS: 30000, // Increased from 10s to 30s
      socketTimeoutMS: 45000,
      // Retry configuration
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      // Network error handling
      retryWrites: true,
      retryReads: true,
      // Additional resilience options
      heartbeatFrequencyMS: 10000, // Check server health every 10s
    });
    
    console.log("✅ MongoDB Connected Successfully");
    
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    
    // Don't exit the process, let the server continue running
  }
};

export default connectDB;
