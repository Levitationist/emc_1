import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { JWT_SECRET } from "../utils.js";

// All the database work for login/register lives here, so the
// controllers only handle HTTP and the routes only map URLs.

export async function registerUser(email, password) {
  if (!email || !password || password.length < 6) {
    throw Object.assign(new Error("Email and a password of 6+ characters are required"), { status: 400 });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    throw Object.assign(new Error("That email is already registered"), { status: 409 });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hash });
  return { token: sign(user), email: user.email };
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  return { token: sign(user), email: user.email };
}

function sign(user) {
  // the token is what the frontend stores and sends on every protected request
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}
