import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Debug environment variables
    console.log("🔍 MongoDB Connection Debug Info:");
    console.log("📍 NODE_ENV:", process.env.NODE_ENV);
    console.log("🔗 MONGO_URI exists:", !!process.env.MONGO_URI);
    
    if (process.env.MONGO_URI) {
      // Mask password for logging
      const maskedUri = process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@');
      console.log("🌐 MongoDB URI (masked):", maskedUri);
    } else {
      console.log("❌ MONGO_URI environment variable is not set!");
      return;
    }

    console.log("⏳ Attempting MongoDB connection...");
    
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
    console.log("📊 Connection state:", mongoose.connection.readyState);
    console.log("🏷️  Database name:", mongoose.connection.name);
    
  } catch (error: any) {
    console.log("\n❌ MongoDB Connection Failed - Detailed Error Info:");
    console.log("🔍 Error name:", error.name);
    console.log("🔍 Error code:", error.code);
    console.log("🔍 Error message:", error.message);
    
    // Specific error handling
    if (error.message?.includes('querySrv ENOTFOUND')) {
      console.log("\n🔧 DNS SRV Resolution Error:");
      console.log("   - This means your network can't resolve MongoDB's SRV records");
      console.log("   - Try changing DNS servers to 8.8.8.8 or 1.1.1.1");
      console.log("   - Or get a non-SRV connection string from Atlas");
      console.log("   - Corporate/school networks often block SRV queries");
    }
    
    if (error.message?.includes('getaddrinfo ENOTFOUND') && error.message?.includes('shard')) {
      console.log("\n🔧 MongoDB Shard DNS Resolution Error:");
      console.log("   - Individual shard nodes can't be resolved");
      console.log("   - This is often a DNS or network connectivity issue");
      console.log("   - Try changing DNS to 8.8.8.8 or 1.1.1.1");
      console.log("   - Consider using a non-SRV connection string");
      console.log("   - Check if you're behind a corporate firewall");
    }
    
    if (error.message?.includes('authentication failed')) {
      console.log("\n🔐 Authentication Error:");
      console.log("   - Check username and password in MONGO_URI");
      console.log("   - Verify user exists in Database Access (Atlas)");
      console.log("   - Check if password contains special characters (URL encode them)");
    }
    
    if (error.message?.includes('connection') || error.message?.includes('timeout')) {
      console.log("\n🌐 Network/Timeout Error:");
      console.log("   - Check if your IP is whitelisted in Network Access (Atlas)");
      console.log("   - Try allowing all IPs (0.0.0.0/0) for testing");
      console.log("   - Check firewall/VPN settings");
      console.log("   - MongoDB Atlas cluster might be down");
    }
    
    if (error.code === 8000) {
      console.log("\n🔑 Authentication Failed (Code 8000):");
      console.log("   - Invalid credentials or user doesn't exist");
    }
    
    // Log full error for debugging
    console.log("\n📝 Full error object:");
    console.log(JSON.stringify(error, null, 2));
    
    console.log("\n🌐 Server will continue running without database connection");
    console.log("🔧 Fix the MongoDB connection to enable full functionality\n");
    
    // Don't exit the process, let the server continue running
  }
};

export default connectDB;
