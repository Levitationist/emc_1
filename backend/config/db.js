import mongoose from "mongoose";

// Connects to the local MongoDB (the mongo container on 27017).
// Keeps retrying until Mongo answers, so `npm run dev` can start
// before the database is ready without crashing.
export async function connectDB() {
  for (let attempt = 1; ; attempt++) {
    try {
      await mongoose.connect("mongodb://127.0.0.1:27017/resume-parser");
      console.log("MongoDB connected");
      return;
    } catch {
      console.log(`MongoDB not ready (attempt ${attempt}), retrying in 2s...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
