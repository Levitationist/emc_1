import { useEffect, useState } from "react";
import { useAuth } from "../auth.jsx";

export default function History() {
  const { authFetch } = useAuth();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch("/api/analyze/history")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-rose-400">{error}</p>;
  if (!items) return <p className="text-slate-400">Loading…</p>;

  const scores = items.map((i) => i.score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const best = scores.length ? Math.max(...scores) : 0;

  // trend line across the 20 most recent analyses (oldest on the left)
  const recent = items.slice(0, 20).reverse();
  const points = recent
    .map((it, i) => `${(i / Math.max(recent.length - 1, 1)) * 300},${100 - it.score}`)
    .join(" ");

  const card = "rounded-2xl border border-white/10 bg-white/[0.03] p-6";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">History</h1>
        <p className="text-slate-400 mt-2">Every analysis you've run, newest first.</p>
      </div>

      {items.length === 0 ? (
        <div className={card + " text-center py-16 text-slate-400"}>
          No analyses yet — run your first one on the Analyzer page.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={card}>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Analyses</p>
              <p className="text-3xl font-bold text-white mt-1">{items.length}</p>
            </div>
            <div className={card}>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Average</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{avg}</p>
            </div>
            <div className={card}>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Best</p>
              <p className="text-3xl font-bold text-white mt-1">{best}</p>
            </div>
            <div className={card}>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Trend</p>
              <svg viewBox="0 0 300 100" className="w-full h-10 mt-2" preserveAspectRatio="none">
                <polyline
                  points={points}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {items.map((it) => (
              <div key={it._id} className={card + " flex items-center gap-4"}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{it.fileName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(it.createdAt).toLocaleString()}
                  </p>
                  {it.jdExcerpt && (
                    <p className="text-xs text-slate-600 mt-1 truncate">JD: {it.jdExcerpt}</p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-full grid place-items-center font-bold text-sm ${
                    it.score >= 75
                      ? "bg-emerald-400/15 text-emerald-400"
                      : it.score >= 50
                        ? "bg-amber-400/15 text-amber-400"
                        : "bg-rose-400/15 text-rose-400"
                  }`}
                >
                  {it.score}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
