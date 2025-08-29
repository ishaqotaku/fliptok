// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

let authRoutes, videosRoutes;

// Safely load route modules
try {
  authRoutes = require('./routes/auth');
  videosRoutes = require('./routes/videos');
} catch (err) {
  console.error('Error loading routes:', err);
  process.exit(1); // Exit if routes fail to load
}

const app = express();

// Use the PORT provided by Azure App Service, fallback to 4000
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videosRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Catch-all for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;