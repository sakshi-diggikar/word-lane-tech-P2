// server.js

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { s3, S3_BUCKET } = require('./s3');
const multer = require('multer');
const upload = multer();

const app = express();

// Routers
const authRoutes = require('./routes/auth');
const hrAPI = require('./routes/hrAPI');
const projectRoutes = require('./routes/projects'); // ✅ project API added

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);                 // Login authentication
app.use('/api/hr/employees', hrAPI);               // HR employee management
app.use('/api/projects', projectRoutes);           //  Project/task/S3 upload

// Static File Serving (if needed for frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));      // to serve from root

// DB Test
pool.query('SELECT 1')
    .then(() => console.log(' DB Connected'))
    .catch(err => console.error(' DB Connect Failed:', err.message));

// Start Server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
