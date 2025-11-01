const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads");
    }
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("📁 File received:", file.originalname);
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Simple upload route without authentication
router.post("/simple", upload.single("file"), async (req, res) => {
  try {
    console.log("📁 Simple upload request received");
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📁 File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Check file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExt)) {
      return res.status(400).json({ message: "Please upload Excel files only (.xlsx or .xls)" });
    }

    // Read and parse Excel file
    let workbook;
    try {
      console.log("📊 Reading Excel file:", req.file.path);
      workbook = xlsx.readFile(req.file.path);
    } catch (error) {
      console.error("❌ Excel parsing error:", error);
      return res.status(400).json({ message: "Invalid Excel file" });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to array format
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const columns = data[0] || [];
    const rows = data.slice(1)
      .filter(row => row && row.length > 0) // Filter empty rows
      .map((row, index) => ({
        row: index + 1,
        values: columns.reduce((obj, col, i) => {
          obj[col] = row[i] || "";
          return obj;
        }, {})
      }));

    console.log("📊 Processed data:", { columns, rowCount: rows.length });

    res.json({
      message: "File uploaded successfully",
      data: rows,
      columns: columns,
      rowCount: rows.length
    });

  } catch (error) {
    console.error(" Error processing file:", error);
    console.error(" Error stack:", error.stack);
    res.status(500).json({ 
      message: "Server error: " + error.message,
      error: error.stack
    });
  }
});

// Simple history endpoint without authentication
router.get("/history-simple", async (req, res) => {
  try {
    // Return mock history data since files aren't saved to database
    const mockHistory = [
      {
        _id: "1",
        originalName: "sample_data.xlsx",
        createdAt: new Date().toISOString(),
        columns: ["Name", "Age", "Department"],
        rowCount: 50
      },
      {
        _id: "2",
        originalName: "sales_report.xlsx",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        columns: ["Product", "Sales", "Region"],
        rowCount: 100
      }
    ];

    res.json(mockHistory);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
