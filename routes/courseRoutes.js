import express from "express";
import { createCourse, getCourses } from "../controllers/courseController.js";
import { protect, isTeacher,isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isAdmin , isTeacher, createCourse);
router.get("/", protect, getCourses);

export { router as courseRouter };
