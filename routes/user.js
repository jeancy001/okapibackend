import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/refresh-token", refreshToken);

// Protected routes
router.get("/profile", protect, getProfile);
router.post("/logout", protect, logoutUser);

export {router as  userRouter}
