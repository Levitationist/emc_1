import { useState, useRef } from "react";

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

// matches r="52" in the SVG below
const RING_LENGTH = 2 * Math.PI * 52;

export default function App() {
  // "idle" -> "analyzing" -> "result"
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(true);
      return;
    }
    setError(false);
    setFileName(file.name);
    setPhase("analyzing");

    // the mock "parser": fake delay, then pick a sample at random
    setTimeout(() => {
      setResult(SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)]);
      setPhase("result");
    }, 1200);
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const ringStyle =
    result && {
      strokeDasharray: RING_LENGTH,
      strokeDashoffset: RING_LENGTH * (1 - result.score / 100),
      stroke:
        result.score >= 75 ? "var(--good)" : result.score >= 50 ? "var(--warn)" : "var(--bad)",
    };

  return (
    <>
      <nav className="nav">
        <span className="logo">0 → Shipped</span>
        <span className="nav-sub">Resume Parser</span>
      </nav>

      <main className="wrap">
        <section className="hero">
          <h1>
            Upload a resume.
            <br />
            Get an instant score.
          </h1>
          <p>See the score, the skills that are present, and the ones that are missing — all on one page.</p>
        </section>

        {phase !== "result" && (
          <section className="card upload-card">
            {phase === "idle" && (
              <div
                className={`dropzone${dragover ? " dragover" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragover(true);
                }}
                onDragLeave={() => setDragover(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragover(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
              >
                <div className="drop-icon">📄</div>
                <p>Drag &amp; drop your resume here</p>
                <label className="btn" htmlFor="fileInput">
                  Choose PDF
                </label>
                {/* ref lets reset() clear it, so the same file can be picked again */}
                <input
                  type="file"
                  id="fileInput"
                  accept=".pdf"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                />
                <p className="hint">Mock build — any PDF works, results are sample data.</p>
                {error && <p className="error">That's not a PDF — choose a .pdf file.</p>}
              </div>
            )}

            {phase === "analyzing" && (
              <div className="analyzing">
                <div className="spinner" />
                <p>Analyzing {fileName}…</p>
              </div>
            )}
          </section>
        )}

        {phase === "result" && result && (
          <section className="card result">
            <div className="score-row">
              <svg className="ring" width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
                <circle className="ring-bg" cx="60" cy="60" r="52" />
                <circle className="ring-fg" cx="60" cy="60" r="52" style={ringStyle} />
                <text className="ring-text" x="60" y="60">
                  {result.score}
                </text>
              </svg>
              <div>
                <h2>Resume score</h2>
                <p className="muted">{result.label}</p>
              </div>
            </div>

            <div className="skill-cols">
              <div className="col present">
                <h3>Skills present</h3>
                <div className="chips">
                  {result.present.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col missing">
                <h3>Skills missing</h3>
                <div className="chips">
                  {result.missing.map((skill) => (
                    <span key={skill} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button className="btn ghost" onClick={reset}>
              Analyze another resume
            </button>
          </section>
        )}
      </main>

      <footer className="footer">0 to Shipped Resume Parser · mock build, no backend</footer>
    </>
  );
}
