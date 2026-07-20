require('dotenv').config();

// --- FORCE CLEAN PUBLIC DNS RESOLUTION OVERRIDE ---
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 
// --------------------------------------------------

const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db'); // <-- 1. Import the DB connection file
const { handleAnalysisRequest } = require('./controllers/analyzeController');

connectDB(); // <-- 2. Actually execute the connection before starting the app!

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/v1/analyze', handleAnalysisRequest);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CodeSentinel Core Engine actively running on port ${PORT}`);
});