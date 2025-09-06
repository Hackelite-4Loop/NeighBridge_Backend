require('dotenv').config();
const mongoose = require('mongoose');

async function debugUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get ALL documents including hidden ones
    console.log('\n=== ALL USERS (including hidden) ===');
    const allUsers = await collection.find({}).toArray();
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}, Status: ${user.status}, ID: ${user._id}`);
    });

    // Check for specific emails
    console.log('\n=== SPECIFIC EMAIL CHECKS ===');
    const emails = ['newtest@example.com', 'test@example.com', 'jane@example.com'];
    
    for (const email of emails) {
      const count = await collection.countDocuments({ email: email.toLowerCase() });
      const users = await collection.find({ email: email.toLowerCase() }).toArray();
      console.log(`Email: ${email} → Count: ${count}, Users: ${users.length}`);
      if (users.length > 0) {
        users.forEach(user => console.log(`  - ${user.name} (${user.status})`));
      }
    }

    // Check indexes
    console.log('\n=== INDEXES ===');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`Index: ${JSON.stringify(index.key)}, Unique: ${index.unique || false}`);
    });

    console.log('\nTotal users:', allUsers.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugUsers();
