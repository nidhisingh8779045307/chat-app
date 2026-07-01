/**
 * Basic real-time chat server.
 *
 * - Express serves a couple of small REST endpoints (dummy login + message history).
 * - Socket.io handles real-time message delivery, join/leave events, and typing indicators.
 * - Everything is stored in memory, so history resets whenever the server restarts.
 *   Swap `db.js`-style storage in later if you need persistence.
 */

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // tighten this to your frontend's URL in production
    methods: ["GET", "POST"],
  },
});

// ---- In-memory "database" ----------------------------------------------
const messages = []; // { id, username, text, timestamp }
const onlineUsers = new Map(); // socket.id -> username

// ---- REST endpoints ------------------------------------------------------

// Dummy login: no password check, just claims a username.
// Returns a fake token the frontend stores and sends back on socket connect.
app.post("/api/login", (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "Username is required" });
  }

  const trimmed = username.trim();
  const alreadyOnline = [...onlineUsers.values()].includes(trimmed);
  if (alreadyOnline) {
    return res.status(409).json({ error: "That username is already in use" });
  }

  // In a real app you'd verify credentials and sign a JWT here.
  const token = Buffer.from(`${trimmed}:${uuidv4()}`).toString("base64");

  return res.json({ username: trimmed, token });
});

// Fetch chat history (e.g. when a client first loads the room)
app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", onlineUsers: onlineUsers.size });
});

// ---- Socket.io real-time layer -------------------------------------------

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Client sends their username right after connecting
  socket.on("join", (username) => {
    if (!username) return;

    onlineUsers.set(socket.id, username);
    socket.data.username = username;

    // Let everyone know who's online, and tell the room someone joined
    io.emit("user_list", [...onlineUsers.values()]);
    socket.broadcast.emit("system_message", {
      id: uuidv4(),
      text: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
    });

    // Send the new user the existing history
    socket.emit("message_history", messages);
  });

  // Client sends a chat message
  socket.on("send_message", (text) => {
    const username = socket.data.username;
    if (!username || !text || !text.trim()) return;

    const message = {
      id: uuidv4(),
      username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    messages.push(message);
    io.emit("receive_message", message); // broadcast to everyone, including sender
  });

  // Typing indicator
  socket.on("typing", (isTyping) => {
    const username = socket.data.username;
    if (!username) return;
    socket.broadcast.emit("user_typing", { username, isTyping });
  });

  socket.on("disconnect", () => {
    const username = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);

    if (username) {
      io.emit("user_list", [...onlineUsers.values()]);
      io.emit("system_message", {
        id: uuidv4(),
        text: `${username} left the chat`,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`Socket disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Chat server listening on http://localhost:${PORT}`);
});
