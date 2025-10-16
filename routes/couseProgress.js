import express from "express";
import { updateProgress, getProgress } from "../controllers/courseProgress.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/update", protect, updateProgress);
router.get("/", protect, getProgress);

export {router as  progressRouter}
