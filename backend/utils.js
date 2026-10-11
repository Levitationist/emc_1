// Shared constants and pure helpers — no Express or database code lives here.

export const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// The skills we know how to recognise in a JD. The AI layer will replace
// this fixed list later — this is the one place that needs changing.
export const SKILL_VOCAB = [
  "JavaScript", "TypeScript", "React", "Node.js", "HTML", "CSS", "Python",
  "Java", "SQL", "MongoDB", "Git", "Docker", "Kubernetes", "AWS", "CI/CD",
  "REST", "GraphQL", "Tailwind", "Testing",
];

// Score = the share of JD skills found in the resume. When the JD names
// none of the known skills, fall back to a random mock so the UI still
// has something to show (real AI scoring comes later).
export function scoreSkills(present, required) {
  if (required.length === 0) return 40 + Math.floor(Math.random() * 40);
  return Math.round((present.length / required.length) * 100);
}
