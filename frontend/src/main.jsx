import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, NavLink } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth.jsx";
import Login from "./pages/Login.jsx";
import Analyzer from "./pages/Analyzer.jsx";
import History from "./pages/History.jsx";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginGate />} />
          <Route path="*" element={<RequireAuth />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// /login: if already logged in, go home instead
function LoginGate() {
  const { token } = useAuth();
  return token ? <Navigate to="/" /> : <Login />;
}

// every other path: only visible with a token
function RequireAuth() {
  const { token } = useAuth();
  return token ? <Shell /> : <Navigate to="/login" />;
}

// The logged-in layout: top nav with links, then the pages
function Shell() {
  const { email, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <nav className="flex items-center justify-between mb-10">
        <span className="font-bold text-white">0 → Shipped</span>
        <div className="flex items-center gap-4 text-sm">
          <NavLink
            to="/analyzer"
            className={({ isActive }) =>
              isActive ? "text-emerald-400 font-medium" : "text-slate-400 hover:text-white transition"
            }
          >
            Analyzer
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? "text-emerald-400 font-medium" : "text-slate-400 hover:text-white transition"
            }
          >
            History
          </NavLink>
          <span className="text-slate-500 hidden sm:inline">{email}</span>
          <button onClick={logout} className="text-slate-400 hover:text-white transition">
            Log out
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/analyzer" />} />
      </Routes>

      <p className="text-center text-xs text-slate-600 mt-12">
        0 to Shipped Resume Parser · MERN stack, AI scoring later
      </p>
    </div>
  );
}

// Attaches React to the <div id="root"> in index.html
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
