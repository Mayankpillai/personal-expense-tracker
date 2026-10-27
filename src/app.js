const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Body parser and CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Expense Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch-all route for unknown API requests
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// For any other client-side routing, serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
