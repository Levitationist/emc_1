import { createContext, useContext, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";
const AuthContext = createContext(null);

// Holds the JWT in localStorage so a refresh keeps you logged in,
// and exposes authFetch() which attaches the token to every request.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("rp_token"));
  const [email, setEmail] = useState(() => localStorage.getItem("rp_email"));

  async function login(email, password) {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    store(data);
  }

  async function register(email, password) {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    store(data);
  }

  function store(data) {
    localStorage.setItem("rp_token", data.token);
    localStorage.setItem("rp_email", data.email);
    setToken(data.token);
    setEmail(data.email);
  }

  function logout() {
    localStorage.removeItem("rp_token");
    localStorage.removeItem("rp_email");
    setToken(null);
    setEmail(null);
  }

  // fetch with the token attached; a 401 logs out everywhere
  async function authFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      logout();
      throw new Error("Session expired — please log in again");
    }
    return res;
  }

  return (
    <AuthContext.Provider value={{ token, email, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
