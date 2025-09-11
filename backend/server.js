const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');

// Note the changed import from auth to Auth
const authRoutes = require('./routes/Auth'); // Updated import
const testRoutes = require('./routes/test');
const resultRoutes = require('./routes/result');
const questionRoutes = require('./routes/question');
const adminRoutes = require('./routes/admin');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // This remains the same
app.use('/api/test', testRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});