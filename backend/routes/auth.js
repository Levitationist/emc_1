import { Router } from "express";
import { register, login } from "../controllers/authController.js";

// URL map only — all logic lives in the controller/service layers.
const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
