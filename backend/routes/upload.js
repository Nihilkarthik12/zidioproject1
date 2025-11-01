const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const auth = require("../middleware/auth");
const ExcelFile = require("../models/ExcelFile");
const path = require("path");
const fs = require("fs");
// Cloudinary integration (optional)
let cloudinaryUpload;
try {
  const cloudinaryConfig = require("../config/cloudinary");
  cloudinaryUpload = cloudinaryConfig.upload;
} catch (error) {
  console.log("Cloudinary not configured, using local storage");
}

const router = express.Router();

// Configure local multer for fallback
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

const localUpload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("📁 File received:", file.originalname);
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Upload Excel file with Cloudinary support (fallback to local)
const uploadMiddleware = cloudinaryUpload ? cloudinaryUpload.single("file") : localUpload.single("file");
router.post("/", auth, uploadMiddleware, async (req, res) => {
  try {
    console.log("📁 File upload request received");
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Check file extension
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExt)) {
      return res.status(400).json({ message: "Please upload Excel files only (.xlsx or .xls)" });
    }

    // Read and parse Excel file
    let workbook;
    try {
      console.log("📊 Reading Excel file:", req.file.path || req.file.buffer);
      
      // Handle both local files and Cloudinary files
      if (req.file.path) {
        // Local file
        workbook = xlsx.readFile(req.file.path);
      } else if (req.file.buffer) {
        // Cloudinary or buffer file
        workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      } else {
        return res.status(400).json({ message: "Unable to process file" });
      }
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

    // SIMPLIFIED: Return data without saving to MongoDB for now
    res.json({
      message: "File uploaded successfully",
      data: rows,
      columns: columns,
      rowCount: rows.length
    });

  } catch (error) {
    console.error("❌ Error processing file:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ File object:", req.file);
    res.status(500).json({ 
      message: "Server error: " + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user'"'"'s upload history
router.get("/history", auth, async (req, res) => {
  try {
    const files = await ExcelFile.find({ userId: req.user.id })
                                  .sort({ createdAt: -1 })
                                  .select("filename originalName createdAt columns data");
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
