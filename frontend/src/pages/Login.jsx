import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await (mode === "login" ? login(email, password) : register(email, password));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20";

  return (
    <div className="max-w-sm mx-auto mt-10">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-emerald-500/5">
        <h1 className="text-2xl font-bold text-white">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-slate-400 mt-1.5">
          {mode === "login"
            ? "Log in to analyze resumes."
            : "Sign up to save your analysis history."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            className={input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={input}
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <button
            disabled={busy}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold rounded-lg py-2.5 text-sm transition"
          >
            {busy ? "…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-slate-400 mt-6 text-center">
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className="text-emerald-400 hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="text-emerald-400 hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
      <p className="text-center text-xs text-slate-600 mt-4">
        Accounts live in MongoDB — passwords hashed with bcrypt.
      </p>
    </div>
  );
}
