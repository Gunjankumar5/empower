const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' ? true : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
  })
);

// Connect Database
connectDB().catch((error) => {
  console.error('Failed to connect to MongoDB:', error.message);
  process.exit(1);
});

// Serve static files (CSS, JS)
let publicDir = path.join(__dirname, "public");
// Fallback: if frontend was moved to a sibling `empower-frontend/public` at repo root, use that
// __dirname is .../empower-backend/src so go two levels up to repo root
const altPublic = path.join(__dirname, "..", "..", "empower-frontend", "public");
if (!fs.existsSync(publicDir) && fs.existsSync(altPublic)) {
  publicDir = altPublic;
}
app.use(express.static(publicDir));

// Serve HTML pages
const htmlFiles = {
  "/": "index.html",
  "/index.html": "index.html",
  "/login.html": "login.html",
  "/register.html": "register.html",
  "/dashboard.html": "dashboard.html",
  "/features.html": "features.html",
  "/contacts.html": "contacts.html",
  "/profile.html": "profile.html",
  "/history.html": "history.html",
};

Object.entries(htmlFiles).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(publicDir, file));
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/nfc', require('./routes/nfc'));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EMPOWER SAFE Backend is running" });
});

const PORT = process.env.PORT || 5000;

// create HTTP server and attach socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});
app.set("io", io); // make io available to routes

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("subscribe_user", (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Handle listen errors (e.g. port already in use) to avoid unhandled exceptions
server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Start the server on a different port or free the port and retry.`);
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
