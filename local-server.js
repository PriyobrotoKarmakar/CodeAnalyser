const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Import API functions
const complexity = require('./api/complexity');
const debug = require('./api/debug');
const create = require('./api/create');
const graphData = require('./api/graph-data');

// Convert Vercel functions to Express routes
const wrapVercelFunction = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// API routes
app.post('/api/complexity', wrapVercelFunction(complexity));
app.post('/api/debug', wrapVercelFunction(debug));
app.post('/api/create', wrapVercelFunction(create));
app.post('/api/graph-data', wrapVercelFunction(graphData));

app.get('/api', (req, res) => {
  res.json({
    status: 'Local API Server Running! 🚀',
    version: '2.0.0',
    endpoints: [
      'POST /api/complexity - Analyze code complexity',
      'POST /api/debug - Debug code issues', 
      'POST /api/create - Generate code solutions',
      'POST /api/graph-data - Generate complexity graphs'
    ],
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}

app.listen(port, () => {
  console.log(`🚀 Local server running on http://localhost:${port}`);
  console.log(`📝 API endpoints available at http://localhost:${port}/api/*`);
  console.log(`🌐 Frontend served from http://localhost:${port}`);
});

module.exports = app;
