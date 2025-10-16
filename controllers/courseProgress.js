import CourseProgress from "../models/CourseProgress.js";

// Update or create progress
export const updateProgress = async (req, res) => {
  const { courseId, progressPercentage } = req.body;
  try {
    let progress = await CourseProgress.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        student: req.user._id,
        course: courseId,
        progressPercentage,
      });
    } else {
      progress.progressPercentage = progressPercentage;
      progress.lastAccessed = new Date();
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student progress
export const getProgress = async (req, res) => {
  try {
    const progress = await CourseProgress.find({
      student: req.user._id,
    }).populate("course", "title");
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
