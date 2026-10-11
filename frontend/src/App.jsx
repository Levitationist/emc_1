import { useState, useRef } from "react";

// matches r="52" in the SVG below
const RING_LENGTH = 2 * Math.PI * 52;

export default function App() {
  // "idle" -> "analyzing" -> "result"
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState(false); // resume is not a PDF
  const [jd, setJd] = useState("");
  const [jdError, setJdError] = useState(false); // JD left empty
  const [apiError, setApiError] = useState(null); // backend unreachable / failed
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  // sends the resume file + JD text to the backend, shows what it returns
  async function analyze(file) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError(true);
      return;
    }
    if (!jd.trim()) {
      setJdError(true);
      return;
    }
    setError(false);
    setJdError(false);
    setApiError(null);
    setFileName(file.name);
    setPhase("analyzing");

    try {
      // FormData is what lets fetch send a file and fields in one request
      const body = new FormData();
      body.append("resume", file);
      body.append("jd", jd);

      const response = await fetch("http://localhost:3000/api/analyze", {
        method: "POST",
        body,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error ${response.status}`);
      }
      setResult(await response.json());
      setPhase("result");
    } catch (err) {
      setApiError(err.message);
      setPhase("idle");
    }
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setError(false);
    setApiError(null);
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
          <p>Upload a resume and paste a job description to see the score, the skills that are present, and the ones that are missing.</p>
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
                <p className="hint">Analysis is a mock from the backend — real AI scoring comes later.</p>
                <div className="jd-block">
                  <label className="jd-label" htmlFor="jdInput">
                    Job description
                  </label>
                  <textarea
                    id="jdInput"
                    className="jd-textarea"
                    rows={7}
                    placeholder="Paste the job description here…"
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                  />
                </div>
                <button className="btn" onClick={() => fileInputRef.current?.click()}>
                  Choose resume PDF &amp; analyze
                </button>
                {jdError && <p className="error">Paste the job description first.</p>}
                {error && <p className="error">That's not a PDF — choose a .pdf file.</p>}
                {apiError && <p className="error">Backend error: {apiError}</p>}
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

      <footer className="footer">0 to Shipped Resume Parser · frontend + express backend, AI scoring later</footer>
    </>
  );
}
