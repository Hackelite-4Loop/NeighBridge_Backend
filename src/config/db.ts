import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "", {
      dbName: "neighbridge",
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message || error);
    console.log("🔧 Note: Make sure your IP address is whitelisted in MongoDB Atlas");
    console.log("🌐 Server will continue running without database connection");
    // Don't exit the process, let the server continue running
  }
};

export default connectDB;
