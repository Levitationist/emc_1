import { Analysis } from "../models/index.js";
import { SKILL_VOCAB, scoreSkills } from "../utils.js";

// All the analysis logic lives here — when the AI part arrives, this
// service is the file that changes. The HTTP layer doesn't need to know.

export async function runAnalysis({ file, jd, userId }) {
  if (!file || !file.originalname.toLowerCase().endsWith(".pdf")) {
    throw Object.assign(new Error("Please upload a resume as a .pdf file"), { status: 400 });
  }
  if (!jd) {
    throw Object.assign(new Error("Paste the job description text"), { status: 400 });
  }

  // which known skills does the JD ask for, and which of those appear
  // in the resume bytes (plain-text-ish for most simple PDFs)
  const haystack = file.buffer.toString("latin1").toLowerCase();
  const required = SKILL_VOCAB.filter((skill) => jd.toLowerCase().includes(skill.toLowerCase()));
  const present = required.filter((skill) => haystack.includes(skill.toLowerCase()));
  const missing = required.filter((skill) => !present.includes(skill));
  const score = scoreSkills(present, required);

  const analysis = await Analysis.create({
    user: userId,
    fileName: file.originalname,
    jdExcerpt: jd.slice(0, 120),
    score,
    present,
    missing,
  });

  return { id: analysis._id, score, present, missing };
}

export async function getHistory(userId) {
  return Analysis.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("fileName jdExcerpt score createdAt");
}
