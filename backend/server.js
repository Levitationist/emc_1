import express from "express";
import cors from "cors";
import multer from "multer";

const app = express();

// The dev server runs on :5173, so allow requests from it
app.use(cors({ origin: "http://localhost:5173" }));

// Resume uploads land in memory (we don't keep the file, we just need its name)
const upload = multer({ storage: multer.memoryStorage() });

// One shared sample set — same data the frontend used to pick locally
const SAMPLE_RESULTS = [
  {
    score: 78,
    label: "Good — a few key skills are missing",
    present: ["JavaScript", "HTML", "CSS", "Git", "REST APIs", "SQL"],
    missing: ["Docker", "CI/CD", "TypeScript"],
  },
  {
    score: 54,
    label: "Fair — solid basics, gaps in tooling",
    present: ["Python", "SQL", "Git"],
    missing: ["React", "Docker", "AWS", "Testing"],
  },
  {
    score: 91,
    label: "Strong — ship-ready",
    present: ["JavaScript", "TypeScript", "React", "Node.js", "Docker", "CI/CD", "SQL"],
    missing: ["Kubernetes"],
  },
];

// The endpoint the frontend calls: resume PDF + JD text in, score + skills out.
// The real analysis comes later — for now it validates the inputs and
// answers with a random sample after a fake delay.
app.post("/api/analyze", upload.single("resume"), (req, res) => {
  const resume = req.file;
  const jd = (req.body.jd || "").trim();

  if (!resume || !resume.originalname.toLowerCase().endsWith(".pdf")) {
    return res.status(400).json({ error: "Please upload a resume as a .pdf file" });
  }
  if (!jd) {
    return res.status(400).json({ error: "Paste the job description text" });
  }

  const result = SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)];

  setTimeout(() => res.json(result), 1200);
});

// Quick health check: curl http://localhost:3000/api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Resume parser backend listening on http://localhost:${PORT}`);
});
