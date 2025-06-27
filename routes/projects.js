// routes/projects.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../db"); //  DB pool
const { createS3Folder, uploadFileToS3 } = require("../utils/s3Utils");

require("dotenv").config();

// ✅ Multer for in-memory file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create teams table if it doesn't exist
async function createTeamsTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS teams (
                team_id INT AUTO_INCREMENT PRIMARY KEY,
                team_name VARCHAR(255) NOT NULL UNIQUE,
                team_description TEXT,
                team_leader_id VARCHAR(50),
                team_created_by VARCHAR(50) NOT NULL,
                team_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                team_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (team_leader_id) REFERENCES employees(emp_user_id) ON DELETE SET NULL,
                FOREIGN KEY (team_created_by) REFERENCES employees(emp_user_id) ON DELETE CASCADE
            )
        `);
        console.log("Teams table ready");
    } catch (error) {
        console.error("Error creating teams table:", error);
    }
}

// Update projects table to include team_id if it doesn't exist
async function updateProjectsTable() {
    try {
        // Check if team_id column exists
        const [columns] = await db.query("SHOW COLUMNS FROM projects LIKE 'team_id'");
        if (columns.length === 0) {
            await db.query(`
                ALTER TABLE projects 
                ADD COLUMN team_id INT,
                ADD FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL
            `);
            console.log("Projects table updated with team_id");
        }
    } catch (error) {
        console.error("Error updating projects table:", error);
    }
}

// Initialize tables
createTeamsTable();
updateProjectsTable();

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
        proj_created_by, // admin user id
        team_id
    } = req.body;

    try {
        // Validate employee
        const [rows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [proj_created_by]);
        if (rows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid proj_created_by" });
        }

        // Validate team
        const [teamRows] = await db.query("SELECT * FROM teams WHERE team_id = ?", [team_id]);
        if (teamRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid team_id" });
        }
        const team = teamRows[0];
        const admin_id = team.team_created_by;
        const team_name = team.team_name;

        // Create S3 folder for admin/team/project
        if (admin_id && team_name && proj_name) {
            await createS3Folder(`${admin_id}/${team_name}/`);
            await createS3Folder(`${admin_id}/${team_name}/${proj_name}/`);
        }

        // Insert project
        await db.query(
            `INSERT INTO projects 
            (proj_name, proj_description, proj_status, proj_start_date, proj_deadline, proj_created_by, team_id, proj_created_at, proj_updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [proj_name, proj_description, proj_status, proj_start_date, proj_deadline, proj_created_by, team_id]
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
 * Uploads a file to S3 bucket in structure: team/project/task/subtask/filename
 */
router.post("/upload-task-file", upload.single("file"), async (req, res) => {
    const { team, project, task, subtask } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // Build S3 folder path
    let folderPath = team;
    if (project) folderPath += `/${project}`;
    if (task) folderPath += `/${task}`;
    if (subtask) folderPath += `/${subtask}`;

    try {
        // Ensure folder exists (S3 is flat, but this is for logical structure)
        await createS3Folder(folderPath);
        // Upload file
        const s3Url = await uploadFileToS3(folderPath, file);
        // TODO: Store s3Url in your DB (e.g., subtask_attachments table)
        res.json({ success: true, url: s3Url });
    } catch (err) {
        console.error("S3 upload error:", err);
        res.status(500).json({ success: false, error: "File upload failed" });
    }
});

/**
 * ✅ POST /api/projects/create-team
 * Create new team with S3 folder structure: admin_id/team_name/
 */
router.post("/create-team", async (req, res) => {
    const {
        team_name,
        team_description,
        leader_id,
        admin_user_id
    } = req.body;

    try {
        // Validate admin user
        const [adminRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        if (adminRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid admin user ID" });
        }

        // Validate leader if provided
        if (leader_id) {
            const [leaderRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [leader_id]);
            if (leaderRows.length === 0) {
                return res.status(400).json({ success: false, error: "Invalid leader ID" });
            }
        }

        // Create S3 folder structure: admin_id/team_name/
        const s3FolderPath = `${admin_user_id}/${team_name}`;
        await createS3Folder(s3FolderPath);

        // Insert team into database
        const [result] = await db.query(
            `INSERT INTO teams 
            (team_name, team_description, team_leader_id, team_created_by, team_created_at, team_updated_at) 
            VALUES (?, ?, ?, ?, NOW(), NOW())`,
            [team_name, team_description, leader_id, admin_user_id]
        );

        const teamId = result.insertId;

        // Fetch the created team with leader details
        const [teamRows] = await db.query(
            `SELECT t.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as leader_name
             FROM teams t 
             LEFT JOIN employees e ON t.team_leader_id = e.emp_user_id 
             WHERE t.team_id = ?`,
            [teamId]
        );

        res.json({ 
            success: true, 
            message: "Team created successfully",
            team: teamRows[0]
        });
    } catch (error) {
        console.error("Team creation error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ PUT /api/projects/update-team/:team_id
 * Update existing team
 */
router.put("/update-team/:team_id", async (req, res) => {
    const { team_id } = req.params;
    const {
        team_name,
        team_description,
        leader_id,
        admin_user_id
    } = req.body;

    try {
        // Validate admin user
        const [adminRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        if (adminRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid admin user ID" });
        }

        // Validate leader if provided
        if (leader_id) {
            const [leaderRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [leader_id]);
            if (leaderRows.length === 0) {
                return res.status(400).json({ success: false, error: "Invalid leader ID" });
            }
        }

        // Check if team exists and belongs to this admin
        const [existingTeam] = await db.query(
            "SELECT * FROM teams WHERE team_id = ? AND team_created_by = ?",
            [team_id, admin_user_id]
        );

        if (existingTeam.length === 0) {
            return res.status(404).json({ success: false, error: "Team not found or access denied" });
        }

        // Update team in database
        await db.query(
            `UPDATE teams 
             SET team_name = ?, team_description = ?, team_leader_id = ?, team_updated_at = NOW()
             WHERE team_id = ?`,
            [team_name, team_description, leader_id, team_id]
        );

        // Fetch the updated team with leader details
        const [teamRows] = await db.query(
            `SELECT t.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as leader_name
             FROM teams t 
             LEFT JOIN employees e ON t.team_leader_id = e.emp_user_id 
             WHERE t.team_id = ?`,
            [team_id]
        );

        res.json({ 
            success: true, 
            message: "Team updated successfully",
            team: teamRows[0]
        });
    } catch (error) {
        console.error("Team update error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ GET /api/projects/teams/:admin_user_id
 * Fetch teams created by this admin
 */
router.get("/teams/:admin_user_id", async (req, res) => {
    const { admin_user_id } = req.params;
    console.log('Fetching teams for admin:', admin_user_id);

    try {
        const [teams] = await db.query(
            `SELECT t.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as leader_name,
                    COUNT(p.proj_id) as project_count
             FROM teams t 
             LEFT JOIN employees e ON t.team_leader_id = e.emp_user_id 
             LEFT JOIN projects p ON t.team_id = p.team_id
             WHERE t.team_created_by = ? 
             GROUP BY t.team_id
             ORDER BY t.team_created_at DESC`,
            [admin_user_id]
        );
        console.log('Teams fetched:', teams.length);
        res.json(teams);
    } catch (err) {
        console.error("Fetch teams error:", err);
        res.status(500).json({ error: "Failed to fetch teams", details: err.message });
    }
});

// Add GET /api/projects/by-team/:team_id endpoint if not present
router.get("/by-team/:team_id", async (req, res) => {
    const { team_id } = req.params;
    console.log('🔍 Backend: Fetching projects for team_id:', team_id);
    console.log('🔍 Backend: Request URL:', req.url);
    console.log('🔍 Backend: Request method:', req.method);
    
    try {
        const [projects] = await db.query(
            `SELECT * FROM projects WHERE team_id = ? ORDER BY proj_created_at DESC`,
            [team_id]
        );
        console.log('🔍 Backend: Found', projects.length, 'projects for team', team_id);
        res.json(projects);
    } catch (err) {
        console.error("❌ Backend: Fetch projects by team error:", err);
        res.status(500).json({ error: "Failed to fetch projects for team" });
    }
});

// Test route to verify router is working
router.get("/test", (req, res) => {
    console.log('🔍 Backend: Test route hit');
    res.json({ message: "Projects router is working!" });
});

module.exports = router;
