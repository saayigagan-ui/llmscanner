// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  language: String,
  rawCode: String,
  scores: {
    security: Number,
    correctness: Number,
    quality: Number,
    overall: Number
  },
  vulnerabilities: [{
    severity: String, // 'Critical', 'High', 'Medium', 'Low'
    type: String,     // e.g., 'SQL Injection'
    line: Number,
    description: String,
    suggestion: String
  }],
  status: { type: String, enum: ['pending', 'completed', 'failed'] }
}, { timestamps: true });

// ESR Rule: Index on userId (Equality), status (Sort), and language (Range)
ReportSchema.index({ userId: 1, status: 1, language: 1 });

module.exports = mongoose.model('Report', ReportSchema);