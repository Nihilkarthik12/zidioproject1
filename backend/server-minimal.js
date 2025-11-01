const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload endpoint
app.post("/api/upload/simple", upload.single("file"), (req, res) => {
  try {
    console.log("📁 Upload request received");
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📁 File:", req.file.originalname);

    // Check file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExt)) {
      return res.status(400).json({ message: "Please upload Excel files only" });
    }

    // Read and parse Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to array format
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const columns = data[0] || [];
    const rows = data.slice(1)
      .filter(row => row && row.length > 0)
      .map((row, index) => ({
        row: index + 1,
        values: columns.reduce((obj, col, i) => {
          obj[col] = row[i] || "";
          return obj;
        }, {})
      }));

    console.log("📊 Processed:", { columns, rowCount: rows.length });

    res.json({
      message: "File uploaded successfully",
      data: rows,
      columns: columns,
      rowCount: rows.length
    });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ 
      message: "Server error: " + error.message
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Minimal server is running"
  });
});

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Minimal Excel Analytics API is running!" });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload/simple`);
});







