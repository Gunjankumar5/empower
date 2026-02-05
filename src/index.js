const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect Database
connectDB();

// Serve static files (CSS, JS)
const publicDir = path.join(__dirname, "public");
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
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/incident", require("./routes/incident"));
app.use("/api/checkin", require("./routes/checkin"));
app.use("/api/community", require("./routes/community"));
app.use("/api/nfc", require("./routes/nfc"));
app.use("/api/emergency", require("./routes/emergency"));
app.use("/api/queries", require("./routes/queries"));
app.use("/api/data", require("./routes/data"));

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

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
