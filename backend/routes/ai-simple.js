const express = require("express");

const router = express.Router();

// Simple AI Analysis endpoint (no authentication required)
router.post("/analyze-simple", async (req, res) => {
  try {
    const { columns, data, rowCount } = req.body;

    if (!columns || !data || !rowCount) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    // Simulate AI analysis (in production, integrate with actual AI service)
    const insights = await generateAIInsights(columns, data, rowCount);

    res.json(insights);
  } catch (error) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ message: "AI analysis failed" });
  }
});

// Simulate AI analysis function
async function generateAIInsights(columns, data, rowCount) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  const numericColumns = columns.filter(col => {
    return data.some(item => {
      const value = item.values[col];
      return !isNaN(parseFloat(value)) && isFinite(value);
    });
  });

  const textColumns = columns.filter(col => !numericColumns.includes(col));

  // Generate patterns
  const patterns = [];
  if (numericColumns.length > 0) {
    patterns.push(`Found ${numericColumns.length} numeric columns suitable for quantitative analysis`);
  }
  if (textColumns.length > 0) {
    patterns.push(`Identified ${textColumns.length} categorical columns for grouping analysis`);
  }
  patterns.push(`Dataset contains ${rowCount} data points for statistical analysis`);

  // Generate recommendations
  const recommendations = [];
  if (numericColumns.length >= 2) {
    recommendations.push(`Consider creating correlation analysis between ${numericColumns.slice(0, 2).join(' and ')}`);
  }
  if (textColumns.length > 0 && numericColumns.length > 0) {
    recommendations.push(`Create grouped analysis using ${textColumns[0]} as categories and ${numericColumns[0]} as values`);
  }
  recommendations.push(`Use time series analysis if date/time columns are present`);
  recommendations.push(`Consider outlier detection for better data quality`);

  // Generate chart suggestions
  const chartSuggestions = [];
  if (numericColumns.length >= 2) {
    chartSuggestions.push(`Scatter plot: ${numericColumns[0]} vs ${numericColumns[1]}`);
  }
  if (textColumns.length > 0 && numericColumns.length > 0) {
    chartSuggestions.push(`Bar chart: ${textColumns[0]} categories with ${numericColumns[0]} values`);
  }
  if (numericColumns.length > 0) {
    chartSuggestions.push(`Histogram: Distribution of ${numericColumns[0]}`);
  }
  chartSuggestions.push(`Pie chart: Distribution of categorical data`);

  // Generate anomalies (simplified)
  const anomalies = [];
  numericColumns.forEach(col => {
    const values = data.map(item => parseFloat(item.values[col])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const outliers = values.filter(v => Math.abs(v - mean) > 2 * Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length));
      if (outliers.length > 0) {
        anomalies.push(`Potential outliers detected in ${col} column (${outliers.length} values)`);
      }
    }
  });

  // Generate summary
  const summary = `This dataset contains ${rowCount} records with ${columns.length} columns. ` +
    `The data includes ${numericColumns.length} quantitative variables and ${textColumns.length} categorical variables. ` +
    `Recommended analysis includes correlation studies, distribution analysis, and pattern recognition.`;

  return {
    patterns,
    recommendations,
    chartSuggestions,
    anomalies,
    summary,
    confidence: 0.85,
    analysisDate: new Date().toISOString()
  };
}

module.exports = router;
