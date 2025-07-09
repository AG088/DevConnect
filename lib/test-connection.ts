import dbConnect from './db';

async function testConnection() {
  try {
    await dbConnect();
    console.log('✅ MongoDB connection successful');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

testConnection(); 