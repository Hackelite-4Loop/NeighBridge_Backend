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
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
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
