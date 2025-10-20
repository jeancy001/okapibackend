import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { startKeepAlive } from "./config/keepAlive.js";

// Routers
import { userRouter } from "./routes/user.js";
import { courseRouter } from "./routes/courseRoutes.js";
import { classRoomRouter } from "./routes/classRoom.js";
import { videoRouter } from "./routes/videoCall.js";

dotenv.config();
connectDB();
startKeepAlive();

const app = express();

// ✅ Allow only your frontend origin (no wildcard)
// const allowedOrigins = [
//   "https://okapijunioracademia.netlify.app", // Your frontend
//   "http://localhost:5173", // For local development
// ];

app.use(
  cors({
    origin:"https://okapijunioracademia.netlify.app",
    credentials: true, // Allow cookies and authentication headers
  })
);

app.use(express.json());
app.use(cookieParser());

// 🧭 API Routes
app.use("/api/auth", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/classrooms", classRoomRouter);
app.use("/api/videos", videoRouter);

app.get("/", (req, res) => res.send("📡 Classroom API Running Successfully"));

// ⚡ Socket.IO Server
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin:['https://okapijunioracademia.netlify.app'],
    credentials: true,
  },
});

// 🎥 Classroom management
const rooms = {}; // { roomCode: [{ socketId, userName, userId, role }] }

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-classroom", ({ roomCode, userName, userId, role }) => {
    socket.join(roomCode);

    if (!rooms[roomCode]) rooms[roomCode] = [];
    rooms[roomCode].push({ socketId: socket.id, userName, userId, role });

    console.log(`👋 ${userName} (${role}) joined room ${roomCode}`);

    const otherUsers = rooms[roomCode].filter((u) => u.socketId !== socket.id);
    socket.emit("all-users", otherUsers);

    socket.to(roomCode).emit("user-joined", {
      socketId: socket.id,
      userName,
      userId,
      role,
    });
  });

  // WebRTC Signaling
  socket.on("offer", ({ target, offer, role, trackType }) => {
    io.to(target).emit("offer", { offer, sender: socket.id, role, trackType });
  });

  socket.on("answer", ({ target, answer, role, trackType }) => {
    io.to(target).emit("answer", { answer, sender: socket.id, role, trackType });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    io.to(target).emit("ice-candidate", { candidate, sender: socket.id });
  });

  // Screen share
  socket.on("screen-share-start", ({ roomCode }) => {
    socket.to(roomCode).emit("teacher-shared-screen", { socketId: socket.id });
  });

  socket.on("screen-share-stop", ({ roomCode }) => {
    socket.to(roomCode).emit("teacher-stopped-screen", { socketId: socket.id });
  });

  // Media toggles
  socket.on("toggle-media", ({ roomCode, userId, mediaType, status }) => {
    socket.to(roomCode).emit("media-toggled", { userId, mediaType, status });
  });

  // Leaving
  socket.on("leave-room", ({ roomCode, userId }) => {
    if (rooms[roomCode]) {
      rooms[roomCode] = rooms[roomCode].filter((u) => u.socketId !== socket.id);
      socket.to(roomCode).emit("user-left", { userId, socketId: socket.id });
      console.log(`🚪 ${userId} left room ${roomCode}`);
      if (rooms[roomCode].length === 0) delete rooms[roomCode];
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    for (const roomCode in rooms) {
      const user = rooms[roomCode].find((u) => u.socketId === socket.id);
      if (user) {
        rooms[roomCode] = rooms[roomCode].filter((u) => u.socketId !== socket.id);
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
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
