import { useState, useRef } from "react";
import { useAuth } from "../auth.jsx";

// matches r="52" in the SVG below
const RING_LENGTH = 2 * Math.PI * 52;

export default function Analyzer() {
  const { authFetch } = useAuth();
  const [phase, setPhase] = useState("idle"); // idle -> analyzing -> result
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);

  async function analyze(file) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("That's not a PDF — choose a .pdf file.");
      return;
    }
    if (!jd.trim()) {
      setError("Paste the job description first.");
      return;
    }
    setError("");
    setFileName(file.name);
    setPhase("analyzing");
    try {
      // FormData lets one request carry the file and the JD text together
      const body = new FormData();
      body.append("resume", file);
      body.append("jd", jd);
      const res = await authFetch("/api/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      setResult(data);
      setPhase("result");
    } catch (err) {
      setError(err.message);
      setPhase("idle");
    }
  }

  function reset() {
    setPhase("idle");
    setResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const ringStyle =
    result && {
      strokeDasharray: RING_LENGTH,
      strokeDashoffset: RING_LENGTH * (1 - result.score / 100),
      stroke: result.score >= 75 ? "#34d399" : result.score >= 50 ? "#fbbf24" : "#fb7185",
    };

  const required = result ? [...result.present, ...result.missing] : [];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          Upload a resume. Get a score.
        </h1>
        <p className="text-slate-400 mt-2">
          Paste a job description, drop your PDF — see matched and missing skills. Every
          analysis is saved to your history.
        </p>
      </div>

      {phase !== "result" && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {phase === "idle" && (
            <>
              <div
                className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
                  dragover ? "border-emerald-400/70 bg-emerald-400/5" : "border-white/15"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragover(true);
                }}
                onDragLeave={() => setDragover(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragover(false);
                  const file = e.dataTransfer.files[0];
                  if (file) analyze(file);
                }}
              >
                <div className="text-4xl">📄</div>
                <p className="mt-2 text-slate-300">Drag &amp; drop your resume here</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg px-5 py-2.5 text-sm transition"
                >
                  Choose PDF
                </button>
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => e.target.files[0] && analyze(e.target.files[0])}
                />
                <p className="mt-4 text-xs text-slate-500">
                  Mock scoring compares JD skills against the resume — AI comes later.
                </p>
              </div>

              <div className="mt-6">
                <label htmlFor="jd" className="block text-sm text-slate-400 mb-2">
                  Job description
                </label>
                <textarea
                  id="jd"
                  rows={7}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/60"
                  placeholder="Paste the job description here…"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </div>

              {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
            </>
          )}

          {phase === "analyzing" && (
            <div className="py-16 text-center">
              <div className="w-9 h-9 mx-auto border-[3px] border-white/10 border-t-emerald-400 rounded-full animate-spin" />
              <p className="mt-4 text-slate-400 text-sm">Analyzing {fileName}…</p>
            </div>
          )}
        </section>
      )}

      {phase === "result" && result && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <svg className="shrink-0" width="140" height="140" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH}
                transform="rotate(-90 60 60)"
                style={{ ...ringStyle, transition: "stroke-dashoffset 0.9s ease" }}
              />
              <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="28" fontWeight="700">
                {result.score}
              </text>
            </svg>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold text-white">Resume score</h2>
              <p className="text-sm text-slate-400 mt-1">{fileName}</p>
              <p className="text-xs text-slate-500 mt-1">
                {result.present.length} of {required.length} JD skills found
                {required.length === 0 && " — no known skills in this JD, mock score used"}
              </p>
            </div>
          </div>

          {required.length > 0 && (
            <div className="mt-8 space-y-3">
              {required.map((skill) => {
                const found = result.present.includes(skill);
                return (
                  <div key={skill} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-slate-300 truncate">{skill}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${found ? "bg-emerald-400" : "bg-rose-400/70"}`}
                        style={{ width: found ? "100%" : "8%" }}
                      />
                    </div>
                    <span className={`w-20 text-right text-xs ${found ? "text-emerald-400" : "text-rose-400"}`}>
                      {found ? "in resume" : "missing"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={reset}
            className="mt-8 border border-white/10 hover:bg-white/5 text-sm text-slate-300 rounded-lg px-4 py-2 transition"
          >
            Analyze another resume
          </button>
        </section>
      )}
    </>
  );
}
