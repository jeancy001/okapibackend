import { Course } from "../models/Course.js";

export const createCourse = async (req, res) => {
  try {
    const { title, description, languagePair } = req.body;
    const course = await Course.create({ title, description, languagePair });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
