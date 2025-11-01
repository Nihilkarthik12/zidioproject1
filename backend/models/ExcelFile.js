const mongoose = require("mongoose");

const excelFileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  data: [{
    row: Number,
    values: mongoose.Schema.Types.Mixed
  }],
  columns: [String]
}, { timestamps: true });

module.exports = mongoose.model("ExcelFile", excelFileSchema);