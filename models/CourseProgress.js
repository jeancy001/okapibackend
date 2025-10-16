import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  progressPercentage: { type: Number, default: 0 },
  completedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "VideoCall" }],
  lastAccessed: { type: Date, default: Date.now },
});

export default mongoose.model("CourseProgress", courseProgressSchema);
