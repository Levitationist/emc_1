// 0 to Shipped Resume Parser — mock logic.
// There is no backend: when a PDF is chosen we fake a short
// "analysis" delay and show one of these sample result sets.

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

// --- element references ---
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const errorText = document.getElementById("errorText");
const analyzing = document.getElementById("analyzing");
const analyzingText = document.getElementById("analyzingText");
const uploadCard = document.getElementById("uploadCard");
const resultCard = document.getElementById("resultCard");
const ringFg = document.getElementById("ringFg");
const scoreText = document.getElementById("scoreText");
const scoreLabel = document.getElementById("scoreLabel");
const presentChips = document.getElementById("presentChips");
const missingChips = document.getElementById("missingChips");
const resetBtn = document.getElementById("resetBtn");

// matches r="52" in the SVG in index.html
const RING_LENGTH = 2 * Math.PI * 52;

// --- wiring ---
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
});

// drag & drop
["dragenter", "dragover"].forEach((event) =>
  dropzone.addEventListener(event, (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  })
);

["dragleave", "drop"].forEach((event) =>
  dropzone.addEventListener(event, (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  })
);

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

resetBtn.addEventListener("click", () => {
  resultCard.hidden = true;
  uploadCard.hidden = false;
  dropzone.hidden = false;
  errorText.hidden = true;
  fileInput.value = ""; // allows re-uploading the same file
});

// --- the mock "parser" ---
function handleFile(file) {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    errorText.hidden = false;
    return;
  }
  errorText.hidden = true;

  // pretend to analyze
  dropzone.hidden = true;
  analyzing.hidden = false;
  analyzingText.textContent = `Analyzing ${file.name}…`;

  setTimeout(() => {
    const result =
      SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)];

    renderResult(result);
    analyzing.hidden = true;
    uploadCard.hidden = true;
    resultCard.hidden = false;
  }, 1200);
}

function renderResult(result) {
  scoreText.textContent = result.score;
  scoreLabel.textContent = result.label;

  // ring fills up as score rises: 0 offset = full circle, full offset = empty
  ringFg.style.strokeDasharray = RING_LENGTH;
  ringFg.style.strokeDashoffset = RING_LENGTH * (1 - result.score / 100);
  ringFg.style.stroke =
    result.score >= 75 ? "var(--good)" : result.score >= 50 ? "var(--warn)" : "var(--bad)";

  presentChips.innerHTML = result.present.map((s) => `<span class="chip">${s}</span>`).join("");
  missingChips.innerHTML = result.missing.map((s) => `<span class="chip">${s}</span>`).join("");
}
