// server.js - Unified Production Server for Render
// Serves Next.js frontend + APIs + Socket.IO on the same HTTP port (process.env.PORT)

// Sanitize runtime environment variables on cloud hosts
process.env.NODE_ENV = "production";
if (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1"))) {
  console.warn("[Server] Unsetting unreachable localhost DATABASE_URL in cloud environment. Falling back to SQLite.");
  delete process.env.DATABASE_URL;
}

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = false;
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("[Server] Error handling request:", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  });

  // Attach Socket.IO to the same HTTP server
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Track participants per room: { [roomId]: Set<socketId> }
  const roomParticipants = new Map();

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a live lecture / classroom room
    socket.on("join-lecture", ({ lectureId, classroomId, userId, userName, role }) => {
      const mainRoom = lectureId || (classroomId ? `class_${classroomId}` : null);
      if (!mainRoom) return;

      socket.join(mainRoom);
      if (classroomId) {
        socket.join(`class_${classroomId}`);
      }
      if (lectureId) {
        socket.join(lectureId);
      }
      socket.data = { lectureId: mainRoom, classroomId, userId, userName, role };

      const roomKey = classroomId ? `class_${classroomId}` : mainRoom;
      if (!roomParticipants.has(roomKey)) {
        roomParticipants.set(roomKey, new Set());
      }
      roomParticipants.get(roomKey).add(socket.id);

      const count = roomParticipants.get(roomKey).size;
      console.log(`[Socket] User ${userName || socket.id} (${role}) joined ${roomKey}. Active: ${count}`);

      // Notify room of updated count
      io.to(roomKey).emit("participant-count", { count });
      if (mainRoom !== roomKey) {
        io.to(mainRoom).emit("participant-count", { count });
      }

      // Notify room of joiner
      socket.to(roomKey).emit("user-joined", {
        userId,
        userName: userName || "A participant",
        role: role || "STUDENT",
      });
    });

    // Interim caption streaming (teacher speaking to students in real-time)
    socket.on("caption-interim", (payload) => {
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        socket.to(r).emit("caption-interim", {
          text: payload?.text || "",
          source: payload?.source || "SPEECH",
        });
      }
    });

    // Final caption segment (speech or gesture)
    socket.on("caption-final", (payload) => {
      const transcript = payload?.transcript || payload;
      if (!transcript) return;
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("caption-final", transcript);
      }
    });

    // Sign Language Gesture detected
    socket.on("sign-detected", (payload) => {
      const gesture = payload?.gesture;
      if (!gesture) return;
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("sign-detected", {
          gesture,
          confidence: payload?.confidence || 1.0,
          timestamp: payload?.timestamp || new Date().toISOString(),
        });
      }
    });

    // Lecture status change (LIVE, PAUSED, COMPLETED)
    socket.on("lecture-status-change", (payload) => {
      const status = payload?.status;
      if (!status) return;
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("lecture-status-change", { status, lectureId });
      }
    });

    // Student Doubt / Raise Hand via Sign Language or Click
    socket.on("student-doubt-raised", (payload) => {
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      const doubtData = {
        studentId: payload?.studentId || socket.data?.userId,
        studentName: payload?.studentName || socket.data?.userName || "Student",
        gesture: payload?.gesture || "QUESTION",
        question: payload?.question || "",
        timestamp: new Date().toISOString(),
      };

      for (const r of rooms) {
        io.to(r).emit("student-doubt-raised", doubtData);
      }
    });

    // Instructor Acknowledges Student Doubt
    socket.on("student-doubt-acknowledged", (payload) => {
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("student-doubt-acknowledged", {
          studentId: payload?.studentId,
          studentName: payload?.studentName,
        });
      }
    });

    // In-Class Live Poll Launch
    socket.on("poll-launch", (payload) => {
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("poll-launch", payload);
      }
    });

    // In-Class Live Poll Vote (Sign, Voice or Click)
    socket.on("poll-vote", (payload) => {
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("poll-vote-update", payload);
      }
    });

    // In-Class Live Poll End
    socket.on("poll-end", (payload) => {
      const lectureId = payload?.lectureId || socket.data?.lectureId;
      const classroomId = payload?.classroomId || socket.data?.classroomId;
      const rooms = new Set();
      if (lectureId) rooms.add(lectureId);
      if (classroomId) rooms.add(`class_${classroomId}`);
      if (rooms.size === 0) return;

      for (const r of rooms) {
        io.to(r).emit("poll-end", payload);
      }
    });

    // Leave lecture
    socket.on("leave-lecture", (payload) => {
      const target = payload?.lectureId || (payload?.classroomId ? `class_${payload.classroomId}` : null) || socket.data?.lectureId;
      if (target) {
        handleLeave(socket, target);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (socket.data && socket.data.classroomId) {
        handleLeave(socket, `class_${socket.data.classroomId}`);
      } else if (socket.data && socket.data.lectureId) {
        handleLeave(socket, socket.data.lectureId);
      }
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  function handleLeave(socket, roomId) {
    socket.leave(roomId);
    if (roomParticipants.has(roomId)) {
      const set = roomParticipants.get(roomId);
      set.delete(socket.id);
      const count = set.size;
      if (count === 0) {
        roomParticipants.delete(roomId);
      } else {
        io.to(roomId).emit("participant-count", { count });
      }
    }
  }

  server.listen(port, hostname, () => {
    console.log(`====================================================`);
    console.log(`  AURALIS PRODUCTION SERVER RUNNING`);
    console.log(`  URL: http://${hostname}:${port}`);
    console.log(`  Next.js + Socket.IO Unified on Port ${port}`);
    console.log(`====================================================`);
  });
}).catch((err) => {
  console.error("[Fatal Server Error] Next.js prepare failed:", err);
  process.exit(1);
});
