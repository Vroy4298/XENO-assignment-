const mongoose = require('mongoose');

// WHY: Retry logic not needed for Atlas — Mongoose handles reconnects.
// We just log clearly so it's obvious if the URI is wrong.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit so the process manager can restart
  }
};

module.exports = connectDB;
