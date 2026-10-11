import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../utils.js";

// Express middleware: checks the Authorization header for a valid token
// and attaches the decoded user to req. Anything behind this middleware
// is protected; without a valid token it answers 401.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  try {
    req.user = jwt.verify(header.replace("Bearer ", ""), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Not logged in" });
  }
}
