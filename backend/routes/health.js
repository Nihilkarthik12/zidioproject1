const express = require("express");
const router = express.Router();

// Health check route
router.get("/", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      PORT: process.env.PORT || 5000,
      MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET'
    }
  });
});

module.exports = router;

