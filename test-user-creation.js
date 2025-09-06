require('dotenv').config();
const mongoose = require('mongoose');

// Import the User model
const { User } = require('./src/modules/users/user.model.ts');

async function testUserCreation() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Try to create a user with a new email
    const userData = {
      userId: 'test-user-12345',
      name: 'Test User',
      email: 'testdb@example.com',
      password: 'Password123!',
      isEmailVerified: false,
      isPhoneVerified: false,
      role: 'user',
      status: 'active',
      joinedCommunities: []
    };

    console.log('Creating user with data:', userData);
    
    const user = new User(userData);
    await user.save();
    
    console.log('✅ User created successfully:', user._id);
    
  } catch (error) {
    console.log('❌ Error creating user:');
    console.log('Code:', error.code);
    console.log('Message:', error.message);
    console.log('KeyValue:', error.keyValue);
    console.log('KeyPattern:', error.keyPattern);
    console.log('Full error:', JSON.stringify(error, null, 2));
  } finally {
    await mongoose.disconnect();
  }
}

testUserCreation();
