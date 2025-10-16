import VideoCall from "../models/VideoCall.js";

/**
 * Handles video call socket events
 * @param {import("socket.io").Server} io
 * @param {import("socket.io").Socket} socket
 */
export const videoSocket = (io, socket) => {
  // ------------------- Authorization check -------------------
  if (!socket.user) {
    console.log("⚠️ Unauthorized socket connection attempted");
    socket.disconnect();
    return;
  }

  console.log(`🎧 ${socket.user.username} (${socket.user.role}) connected`);

  // ------------------- Join Room -------------------
  socket.on("join-room", async (roomId, callback) => {
    try {
      if (!roomId) {
        return callback?.({ success: false, message: "Room ID is required" });
      }

      let room = await VideoCall.findOne({ roomId });

      // Create room if it doesn't exist
      if (!room) {
        room = await VideoCall.create({
          roomId,
          host: socket.user._id,
          participants: [
            {
              user: socket.user._id,
              username: socket.user.username,
              role: socket.user.role,
            },
          ],
        });
      } else {
        // Check if room is full
        if (room.participants.length >= 12) {
          return callback?.({ success: false, message: "Room is full (max 12 participants)" });
        }

        // Check if user already joined
        const alreadyJoined = room.participants.some(
          (p) => p.user.toString() === socket.user._id.toString()
        );

        if (!alreadyJoined) {
          room.participants.push({
            user: socket.user._id,
            username: socket.user.username,
            role: socket.user.role,
          });
          await room.save();
        }
      }

      socket.join(roomId);

      // ------------------- Notify other participants -------------------
      socket.to(roomId).emit("user-joined", {
        id: socket.user._id.toString(),
        name: socket.user.username,
        role: socket.user.role,
      });

      // ------------------- Send existing participants to the new user -------------------
      const existingParticipants = room.participants
        .filter((p) => p.user.toString() !== socket.user._id.toString())
        .map((p) => ({
          id: p.user.toString(),
          name: p.username,
          role: p.role,
        }));

      socket.emit("existing-participants", existingParticipants);

      // ------------------- Callback success -------------------
      callback?.({ success: true });
    } catch (err) {
      console.error("Join room error:", err);
      callback?.({ success: false, message: "Failed to join room" });
    }
  });

  // ------------------- WebRTC Signaling -------------------
  socket.on("offer", (data) => {
    if (data?.roomId) socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    if (data?.roomId) socket.to(data.roomId).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    if (data?.roomId && data.candidate) socket.to(data.roomId).emit("ice-candidate", data.candidate);
  });

  // ------------------- Disconnect -------------------
  socket.on("disconnect", async () => {
    console.log(`❌ ${socket.user.username} disconnected`);
    try {
      const rooms = await VideoCall.find({ "participants.user": socket.user._id });
      for (const room of rooms) {
        room.participants = room.participants.filter(
          (p) => p.user.toString() !== socket.user._id.toString()
        );
        await room.save();

        // Notify remaining participants
        io.to(room.roomId).emit("user-left", socket.user._id.toString());
      }
    } catch (err) {
      console.error("Error removing disconnected user from rooms:", err);
    }
  });
};
