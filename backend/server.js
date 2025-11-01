const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/health", require("./routes/health"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/upload", require("./routes/upload-test")); // Test route
app.use("/api/upload", require("./routes/upload-simple")); // Simple route
app.use("/api/admin", require("./routes/admin"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/ai", require("./routes/ai-simple"));

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Excel Analytics API is running!" });
});

// Start HTTP server first, with auto-fallback if port is in use, then connect to MongoDB
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/excel-analytics";

function startServer(desiredPort, attemptsLeft = 5) {
  const server = app.listen(desiredPort, () => {
    console.log(`🚀 Server running on port ${desiredPort}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE" && attemptsLeft > 0) {
      const nextPort = desiredPort + 1;
      console.warn(`Port ${desiredPort} in use, trying ${nextPort}...`);
      startServer(nextPort, attemptsLeft - 1);
    } else {
      throw err;
    }
  });
}

startServer(PORT);


// Serve React frontend build (after all API routes)
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
  });


