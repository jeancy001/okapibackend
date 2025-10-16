import express from "express";
import {
  startSession,
  joinSession,
  endSession,
  getClassSessions,
} from "../controllers/videoController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startSession);
router.post("/join", protect, joinSession);
router.post("/end", protect, endSession);
router.get("/:classId", protect, getClassSessions);

export{router as  videoRouter};
