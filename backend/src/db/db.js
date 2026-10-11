const mongoose = require('mongoose');

async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.warn('⚠️  MONGODB_URI is not set in environment variables. Database operations will fail until configured.');
        return null;
    }

    try {
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        return null;
    }
}

module.exports = connectDB;