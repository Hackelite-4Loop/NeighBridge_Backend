const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('🔗 MongoDB URI exists:', process.env.MONGO_URI ? 'Yes' : 'No');

if (process.env.MONGO_URI) {
  // Hide password in logs
  const uriForLog = process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@');
  console.log('🌐 MongoDB URI (masked):', uriForLog);
}

async function testConnection() {
  try {
    console.log('⏳ Attempting to connect...');
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('🏷️  Database name:', mongoose.connection.name);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:');
    console.log('🔍 Error message:', error.message);
    console.log('🏷️  Error code:', error.code);
    console.log('📝 Error name:', error.name);
    
    if (error.message.includes('authentication failed')) {
      console.log('🔐 Possible causes:');
      console.log('   - Incorrect username or password');
      console.log('   - User doesn\'t exist in MongoDB Atlas');
    }
    
    if (error.message.includes('connection') || error.message.includes('timeout')) {
      console.log('🌐 Possible causes:');
      console.log('   - IP address not whitelisted in MongoDB Atlas');
      console.log('   - Network/firewall blocking connection');
      console.log('   - MongoDB Atlas cluster is down');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testConnection();
