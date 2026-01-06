import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URL, {
      bufferCommands: false,
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    throw error;
  }
};

export default connectDB;
