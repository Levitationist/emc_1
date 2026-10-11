import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { analyze, history } from "../controllers/analysisController.js";

// URL map only — logic lives in the controller/service layers.
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, upload.single("resume"), analyze);
router.get("/history", requireAuth, history);

export default router;
