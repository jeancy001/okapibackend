import mongoose from "mongoose";

const VideoParticipantSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher"], default: "student" },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null }, // set when participant leaves
});

const VideoRoomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    participants: [VideoParticipantSchema], // snapshot per session
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // optional extra info
  },
  { timestamps: true }
);

export const VideoRoom = mongoose.model("VideoRoom", VideoRoomSchema);

