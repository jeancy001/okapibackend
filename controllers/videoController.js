
import { VideoSession } from "../models/VideoSession.js";
import { ClassRoom } from "../models/ClassRoom.js";

/**
 * ✅ Start a new video session for a classroom
 */
export const startSession = async (req, res) => {
  try {
    const { roomCode } = req.body;
    const teacherId = req.user?._id || req.body.teacherId;

    // 1️⃣ Validate input
    if (!roomCode || !teacherId) {
      return res.status(400).json({ message: "Missing required fields: roomCode or teacherId" });
    }

    // 2️⃣ Find classroom by its code
    const classroom = await ClassRoom.findOne({ roomCode }).populate("course");
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // 3️⃣ Prevent multiple active sessions
    const active = await VideoSession.findOne({
      classroom: classroom._id,
      endedAt: null,
    });
    if (active) {
      return res
        .status(400)
        .json({ message: "An active session already exists for this classroom" });
    }

    // 4️⃣ Create new session
    const session = await VideoSession.create({
      classroom: classroom._id,
      createdBy: teacherId,
      participants: [teacherId],
      startedAt: new Date(),
    });

    return res.status(201).json({
      message: "Video session started successfully",
      session,
    });
  } catch (error) {
    console.error("❌ Error starting session:", error);
    return res.status(500).json({ message: "Server error while starting session" });
  }
};

/**
 * ✅ Join an existing video session
 */
export const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!sessionId || !userId) {
      return res.status(400).json({ message: "Missing required fields: sessionId or userId" });
    }

    const session = await VideoSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Video session not found" });
    }

    // Prevent duplicates
    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      await session.save();
    }

    return res.status(200).json({
      message: "Joined session successfully",
      session,
    });
  } catch (error) {
    console.error("❌ Error joining session:", error);
    return res.status(500).json({ message: "Server error while joining session" });
  }
};

/**
 * ✅ End a video session
 */
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await VideoSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.endedAt) {
      return res.status(400).json({ message: "Session already ended" });
    }

    session.endedAt = new Date();
    await session.save();

    return res.status(200).json({
      message: "Session ended successfully",
      session,
    });
  } catch (error) {
    console.error("❌ Error ending session:", error);
    return res.status(500).json({ message: "Server error while ending session" });
  }
};

/**
 * ✅ Get all video sessions for a specific classroom
 */
export const getClassSessions = async (req, res) => {
  try {
    const { classId } = req.params;

    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    const sessions = await VideoSession.find({ classroom: classId })
      .populate("participants", "username email role")
      .populate("createdBy", "username email role")
      .sort({ startedAt: -1 })
      .lean();

    return res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("❌ Error fetching class sessions:", error);
    return res.status(500).json({ message: "Server error while fetching sessions" });
  }
};
