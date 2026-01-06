import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/db_config.js";

// Connect DB once (safe for Vercel)

await connectDB();


// ❌ NO app.listen()
export default app;
