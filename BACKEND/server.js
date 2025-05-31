const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment')
const connectDB = require('./config/db');
const multer = require('multer');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
});

// Middleware
app.use(cors("*"));
app.use(express.json({ limit: '10mb' })); // Increase JSON body limit
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointment', appointmentRoutes);

// Connect to MongoDB
connectDB();
// Error handling
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));