import mongoose from "mongoose";

const classRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roomCode: {
      type: String,
      unique: true,
      default: () =>
        `ROOM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    },
  },
  { timestamps: true }
);

export const ClassRoom = mongoose.model("ClassRoom", classRoomSchema);
