import * as authService from "../services/authService.js";

// Controllers sit between routes and services: they know about HTTP
// (request/response) but contain no business logic themselves.

export async function register(req, res) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.registerUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
}
