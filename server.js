const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const uploadRoutes = require('./routes/uploadRoutes');
const callRoutes = require('./routes/callRoutes');
const leadRoutes = require('./routes/leadRoutes');
const appointmentRoutes = require('./routes/appointmentsRoutes');

// Import database config
const {connectDB} = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Connect to Database (MongoDB or in-memory)
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default
    'http://localhost:3000',  // React default
    'http://127.0.0.1:5173'   // Alternative localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'AI Caller Agent Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;