
import express from "express";
import {
  createClassRoom,
  addStudentToClass,
  getAllClassRooms,
} from "../controllers/ClassRoomController.js";

import { protect, isTeacher } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, isTeacher, createClassRoom);
router.post("/:classId/add-student", protect, addStudentToClass);
router.get("/", protect, getAllClassRooms);

export { router as classRoomRouter };
