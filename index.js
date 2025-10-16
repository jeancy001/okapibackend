import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

// Routers
import { userRouter } from "./routes/user.js";
import { courseRouter } from "./routes/courseRoutes.js";
import { classRoomRouter } from "./routes/classRoom.js";
import { videoRouter } from "./routes/videoCall.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 🧭 API Routes
app.use("/api/auth", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/classrooms", classRoomRouter);
app.use("/api/videos", videoRouter);

app.get("/", (req, res) => res.send("📡 Classroom API Running Successfully"));

// ⚡ Setup Socket Server
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// 🎥 Video/Meeting Room Management
const rooms = {}; // { roomCode: [socketIds] }

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Join classroom
  socket.on("join-classroom", ({ roomCode, userName, userId }) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) rooms[roomCode] = [];
    rooms[roomCode].push({ socketId: socket.id, userName, userId });

    console.log(`👋 ${userName} joined room ${roomCode}`);

    // Send existing participants (excluding the new user)
    const otherUsers = rooms[roomCode].filter(
      (user) => user.socketId !== socket.id
    );
    socket.emit("all-users", otherUsers);

    // Notify others about the new participant
    socket.to(roomCode).emit("user-joined", {
      socketId: socket.id,
      userName,
      userId,
    });
  });

  // 📞 WebRTC Signaling Events
  socket.on("offer", ({ target, offer }) => {
    io.to(target).emit("offer", { offer, sender: socket.id });
  });

  socket.on("answer", ({ target, answer }) => {
    io.to(target).emit("answer", { answer, sender: socket.id });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { candidate, sender: socket.id });
  });

  // 🎤 Toggle media status (video/audio)
  socket.on("toggle-media", ({ roomCode, userId, mediaType, status }) => {
    socket.to(roomCode).emit("media-toggled", {
      userId,
      mediaType,
      status,
    });
  });

  // 🚪 Handle user leaving a room
  socket.on("leave-room", ({ roomCode, userId }) => {
    if (rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter(
        (user) => user.socketId !== socket.id
      );
      socket.to(roomCode).emit("user-left", { userId, socketId: socket.id });
      console.log(`🚪 ${userId} left room ${roomCode}`);
      if (rooms[roomCode].length === 0) delete rooms[roomCode];
    }
  });

  // ❌ Handle disconnects
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    for (const roomCode in rooms) {
      const user = rooms[roomCode].find((u) => u.socketId === socket.id);
      if (user) {
        rooms[roomCode] = rooms[roomCode].filter(
          (u) => u.socketId !== socket.id
        );
        socket.to(roomCode).emit("user-left", {
          userId: user.userId,
          socketId: socket.id,
        });
        if (rooms[roomCode].length === 0) delete rooms[roomCode];
      }
    }
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
