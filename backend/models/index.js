import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash, never the plain password
});

const analysisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: String,
    jdExcerpt: String,
    score: Number,
    present: [String],
    missing: [String],
  },
  { timestamps: true } // adds createdAt, which the history list uses
);

export const User = mongoose.model("User", userSchema);
export const Analysis = mongoose.model("Analysis", analysisSchema);
