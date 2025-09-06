const { MongoClient } = require('mongodb');
require('dotenv').config();

async function listUsers() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const users = await db.collection('users').find({}).toArray();
    
    console.log('\nUsers in database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name}, ID: ${user._id}`);
    });
    
    console.log(`\nTotal users: ${users.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

listUsers();
