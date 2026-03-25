import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sawari';
console.log('Attempting to connect to:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
