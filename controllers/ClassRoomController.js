
import { ClassRoom } from "../models/ClassRoom.js";


export const createClassRoom = async (req, res) => {
  try {
    const { name, courseId, teacherId } = req.body;
    const exists = await ClassRoom.findOne({ name });
    if (exists) return res.status(400).json({ message: "Class already exists" });

    const classroom = await ClassRoom.create({
      name,
      course: courseId,
      teacher: teacherId,
    });

    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addStudentToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const classroom = await ClassRoom.findById(classId);
    if (!classroom) return res.status(404).json({ message: "Class not found" });

    if (!classroom.students.includes(studentId)) {
      classroom.students.push(studentId);
      await classroom.save();
    }

    res.json({ message: "Student added", classroom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllClassRooms = async (req, res) => {
  try {
    const rooms = await ClassRoom.find()
      .populate("teacher", "name email")
      .populate("students", "name email")
      .populate("course", "title languagePair");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
