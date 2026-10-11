import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import analyzeRoutes from "./routes/analyze.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json()); // parses JSON bodies for login/register

app.use("/api/auth", authRoutes);       // no token needed (register, login)
app.use("/api/analyze", analyzeRoutes); // token checked by middleware
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// connect to Mongo first, then start listening
await connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Resume parser backend listening on http://localhost:${PORT}`);
});
