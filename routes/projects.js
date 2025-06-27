// routes/projects.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const AWS = require("aws-sdk");
const db = require("../db"); // ✅ DB pool

require("dotenv").config();

// ✅ AWS S3 config
const s3 = new AWS.S3({
    region: "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// ✅ Multer for in-memory file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * ✅ POST /api/projects/create
 * Create new project
 */
router.post("/create", async (req, res) => {
    const {
        proj_name,
        proj_description,
        proj_status,
        proj_start_date,
        proj_deadline,
        emp_user_id,
        team_name,
    } = req.body;

    try {
        // Validate employee
        const [rows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [emp_user_id]);
        if (rows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid emp_user_id" });
        }

        // Insert project
        await db.query(
            `INSERT INTO projects 
            (proj_name, proj_description, proj_status, proj_start_date, proj_deadline, proj_created_by, proj_created_at, proj_updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [proj_name, proj_description, proj_status, proj_start_date, proj_deadline, emp_user_id]
        );

        res.json({ success: true, message: "Project created successfully" });
    } catch (error) {
        console.error("Project insert error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ GET /api/projects/by-user/:emp_user_id
 * Fetch projects created by this admin
 */
router.get("/by-user/:emp_user_id", async (req, res) => {
    const { emp_user_id } = req.params;

    try {
        const [projects] = await db.query(
            "SELECT * FROM projects WHERE proj_created_by = ? ORDER BY proj_created_at DESC",
            [emp_user_id]
        );
        res.json(projects);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
});

/**
 * ✅ POST /api/projects/upload-task-file
 * Uploads a file to S3 bucket in structure: emp_user_id/team/project/task/filename
 */
router.post("/upload-task-file", upload.single("file"), async (req, res) => {
    const { emp_user_id, team, project, task } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const Key = `${emp_user_id}/${team}/${project}/${task}/${file.originalname}`;

    try {
        await s3.upload({
            Bucket: process.env.S3_BUCKET_NAME,
            Key,
            Body: file.buffer,
        }).promise();

        res.json({ success: true, key: Key });
    } catch (err) {
        console.error("S3 upload error:", err);
        res.status(500).json({ success: false, error: "File upload failed" });
    }
});

module.exports = router;
