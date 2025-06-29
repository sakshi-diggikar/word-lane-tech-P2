// routes/projects.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../db"); //  DB pool
const { createS3Folder, uploadFileToS3, deleteS3Folder } = require("../utils/s3Utils");
const { s3 } = require("../s3"); // Fixed S3 import

require("dotenv").config();

// Debug route to test router
router.get("/debug", (req, res) => {
    console.log('🔍 Debug route hit');
    res.json({ message: "Projects router is working!", routes: ["delete-team", "delete-project", "delete-task", "delete-subtask"] });
});

// ✅ Multer for in-memory file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create progress_levels table if it doesn't exist
async function createProgressLevelsTable() {
    try {
        // Check if the table exists and has the correct structure
        const [columns] = await db.query("SHOW COLUMNS FROM progress_levels LIKE 'progress_level'");
        if (columns.length === 0) {
            // Table doesn't exist or has wrong structure, create it
            await db.query(`
                CREATE TABLE IF NOT EXISTS progress_levels (
                    progress_id INT AUTO_INCREMENT PRIMARY KEY,
                    progress_level VARCHAR(50) NOT NULL UNIQUE,
                    progress_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    progress_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
        }
        // Insert default progress levels if they don't exist
        const [existingLevels] = await db.query("SELECT COUNT(*) as count FROM progress_levels");
        if (existingLevels[0].count === 0) {
            await db.query(`
                INSERT INTO progress_levels (progress_id, progress_level) VALUES
                (1, 'Pending'),
                (2, 'In Progress'),
                (3, 'Completed'),
                (4, 'On Hold'),
                (5, 'Cancelled')
            `);
            console.log("Progress levels table created and populated");
        } else {
            console.log("Progress levels table ready");
        }
    } catch (error) {
        console.error("Error creating progress_levels table:", error);
    }
}
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
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
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
            break; // Success, exit retry loop
    } catch (error) {
            retryCount++;
            if (error.code === 'ER_LOCK_DEADLOCK' && retryCount < maxRetries) {
                console.log(`Deadlock detected on projects table update, retrying (${retryCount}/${maxRetries})...`);
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
            } else {
        console.error("Error updating projects table:", error);
                break;
            }
        }
    }
}

// Fix foreign key constraints for existing tables
async function fixForeignKeyConstraints() {
    try {
        // 1. Find and drop wrong constraint for subtasks table
        const [subtasksConstraints] = await db.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'subtasks' 
              AND COLUMN_NAME = 'employee_id' 
              AND REFERENCED_COLUMN_NAME = 'emp_id'
        `);
        for (const row of subtasksConstraints) {
            try {
                await db.query(`ALTER TABLE subtasks DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`);
                console.log(`Dropped subtasks constraint: ${row.CONSTRAINT_NAME}`);
            } catch (dropError) {
                console.log(`Could not drop subtasks constraint ${row.CONSTRAINT_NAME}:`, dropError.message);
            }
        }
        
        // 2. Add correct constraint for subtasks (if not exists)
        const [existingSubtasks] = await db.query(`
            SELECT * FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'subtasks' 
              AND COLUMN_NAME = 'employee_id' 
              AND REFERENCED_COLUMN_NAME = 'emp_user_id'
        `);
        if (existingSubtasks.length === 0) {
            try {
                await db.query(`ALTER TABLE subtasks ADD CONSTRAINT subtask_employee_fk FOREIGN KEY (employee_id) REFERENCES employees(emp_user_id) ON DELETE SET NULL`);
                console.log("Added subtasks employee foreign key constraint");
            } catch (addError) {
                console.log("Could not add subtasks employee foreign key constraint:", addError.message);
            }
        }

        // 3. Find and drop wrong constraint for subtask_assignment
        const [subtaskAssignmentConstraints] = await db.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'subtask_assignment' 
              AND COLUMN_NAME = 'employee_id' 
              AND REFERENCED_COLUMN_NAME = 'emp_id'
        `);
        for (const row of subtaskAssignmentConstraints) {
            try {
                await db.query(`ALTER TABLE subtask_assignment DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`);
                console.log(`Dropped constraint: ${row.CONSTRAINT_NAME}`);
            } catch (dropError) {
                console.log(`Could not drop constraint ${row.CONSTRAINT_NAME}:`, dropError.message);
            }
        }
        
        // 4. Add correct constraint for subtask_assignment (if not exists)
        const [existingAssignment] = await db.query(`
            SELECT * FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'subtask_assignment' 
              AND COLUMN_NAME = 'employee_id' 
              AND REFERENCED_COLUMN_NAME = 'emp_user_id'
        `);
        if (existingAssignment.length === 0) {
            try {
                await db.query(`ALTER TABLE subtask_assignment ADD CONSTRAINT subtask_assignment_employee_fk FOREIGN KEY (employee_id) REFERENCES employees(emp_user_id) ON DELETE CASCADE`);
                console.log("Added subtask_assignment employee foreign key constraint");
            } catch (addError) {
                console.log("Could not add subtask_assignment employee foreign key constraint:", addError.message);
            }
        }
        
        // 5. Find and drop wrong constraint for subtask_attachment
        const [subtaskAttachmentConstraints] = await db.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'subtask_attachment' 
              AND COLUMN_NAME = 'subatt_uploaded_by' 
              AND REFERENCED_COLUMN_NAME = 'emp_id'
        `);
        for (const row of subtaskAttachmentConstraints) {
            try {
                await db.query(`ALTER TABLE subtask_attachment DROP FOREIGN KEY ${row.CONSTRAINT_NAME}`);
                console.log(`Dropped constraint: ${row.CONSTRAINT_NAME}`);
            } catch (dropError) {
                console.log(`Could not drop constraint ${row.CONSTRAINT_NAME}:`, dropError.message);
            }
        }
        
        // 6. Add correct constraint for subtask_attachment (if not exists)
        const [existingAttachment] = await db.query(`
            SELECT * FROM information_schema.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'subtask_attachment' 
              AND COLUMN_NAME = 'subatt_uploaded_by' 
              AND REFERENCED_COLUMN_NAME = 'emp_user_id'
        `);
        if (existingAttachment.length === 0) {
            try {
                await db.query(`ALTER TABLE subtask_attachment ADD CONSTRAINT fk_subatt_employee FOREIGN KEY (subatt_uploaded_by) REFERENCES employees(emp_user_id) ON DELETE SET NULL`);
                console.log("Added subtask_attachment employee foreign key constraint");
            } catch (addError) {
                console.log("Could not add subtask_attachment employee foreign key constraint:", addError.message);
            }
        }
        
        console.log("Foreign key constraints fixed");
    } catch (err) {
        console.error("Error fixing foreign key constraints:", err);
    }
}

// Create subtask_assignment table if it doesn't exist
async function createSubtaskAssignmentTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS subtask_assignment (
                subass_id INT AUTO_INCREMENT PRIMARY KEY,
                subtask_id INT,
                employee_id VARCHAR(50),
                subass_assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                subass_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE
            )
        `);
        
        // Add foreign key constraint separately to avoid data type issues
        try {
            await db.query(`
                ALTER TABLE subtask_assignment 
                ADD CONSTRAINT subtask_assignment_employee_fk 
                FOREIGN KEY (employee_id) REFERENCES employees(emp_user_id) ON DELETE CASCADE
            `);
        } catch (fkError) {
            // If constraint already exists or fails, ignore
            console.log("Foreign key constraint for employee_id already exists or failed to add");
        }
        
        console.log("Subtask assignment table ready");
    } catch (error) {
        console.error("Error creating subtask_assignment table:", error);
    }
}

// Create subtask_attachment table if it doesn't exist
async function createSubtaskAttachmentTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS subtask_attachment (
                subatt_id INT AUTO_INCREMENT PRIMARY KEY,
                subatt_subtask_id INT,
                subatt_file_name VARCHAR(255),
                subatt_file_type VARCHAR(100),
                subatt_file_path TEXT,
                subatt_uploaded_by VARCHAR(50),
                subatt_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                subatt_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (subatt_subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE
            )
        `);
        
        // Add foreign key constraint separately to avoid data type issues
        try {
            await db.query(`
                ALTER TABLE subtask_attachment 
                ADD CONSTRAINT fk_subatt_employee 
                FOREIGN KEY (subatt_uploaded_by) REFERENCES employees(emp_user_id) ON DELETE SET NULL
            `);
        } catch (fkError) {
            // If constraint already exists or fails, ignore
            console.log("Foreign key constraint for subatt_uploaded_by already exists or failed to add");
        }
        
        console.log("Subtask attachment table ready");
    } catch (error) {
        console.error("Error creating subtask_attachment table:", error);
    }
}

// Create subtasks table if it doesn't exist
async function createSubtasksTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS subtasks (
                subtask_id INT AUTO_INCREMENT PRIMARY KEY,
                subtask_name VARCHAR(50),
                subtask_description VARCHAR(255),
                task_id INT,
                employee_id VARCHAR(50),
                subtask_status INT DEFAULT 1,
                subtask_priority VARCHAR(20) DEFAULT 'Medium',
                subtask_deadline DATETIME,
                subtask_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                subtask_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(emp_user_id) ON DELETE SET NULL,
                FOREIGN KEY (subtask_status) REFERENCES progress_levels(progress_id) ON DELETE SET NULL
            )
        `);
        console.log("Subtasks table ready");
    } catch (error) {
        console.error("Error creating subtasks table:", error);
    }
}

// Update subtasks table to include priority and deadline if they don't exist
async function updateSubtasksTable() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            // Check if subtask_priority column exists
            const [priorityColumns] = await db.query("SHOW COLUMNS FROM subtasks LIKE 'subtask_priority'");
            if (priorityColumns.length === 0) {
                await db.query(`
                    ALTER TABLE subtasks 
                    ADD COLUMN subtask_priority VARCHAR(20) DEFAULT 'Medium'
                `);
                console.log("Subtasks table updated with subtask_priority column");
            }
            
            // Check if subtask_deadline column exists
            const [deadlineColumns] = await db.query("SHOW COLUMNS FROM subtasks LIKE 'subtask_deadline'");
            if (deadlineColumns.length === 0) {
                await db.query(`
                    ALTER TABLE subtasks 
                    ADD COLUMN subtask_deadline DATETIME
                `);
                console.log("Subtasks table updated with subtask_deadline column");
            }

            // Check if subtask_progress column exists
            const [progressColumns] = await db.query("SHOW COLUMNS FROM subtasks LIKE 'subtask_progress'");
            if (progressColumns.length === 0) {
                await db.query(`
                    ALTER TABLE subtasks 
                    ADD COLUMN subtask_progress INT DEFAULT 0
                `);
                console.log("Subtasks table updated with subtask_progress column");
            }

            // Check if subtask_completion_feedback column exists
            const [feedbackColumns] = await db.query("SHOW COLUMNS FROM subtasks LIKE 'subtask_completion_feedback'");
            if (feedbackColumns.length === 0) {
                await db.query(`
                    ALTER TABLE subtasks 
                    ADD COLUMN subtask_completion_feedback TEXT
                `);
                console.log("Subtasks table updated with subtask_completion_feedback column");
            }

            // Check if subtask_completed_at column exists
            const [completedAtColumns] = await db.query("SHOW COLUMNS FROM subtasks LIKE 'subtask_completed_at'");
            if (completedAtColumns.length === 0) {
                await db.query(`
                    ALTER TABLE subtasks 
                    ADD COLUMN subtask_completed_at DATETIME
                `);
                console.log("Subtasks table updated with subtask_completed_at column");
            }
            
            break; // Success, exit retry loop
        } catch (error) {
            retryCount++;
            if (error.code === 'ER_LOCK_DEADLOCK' && retryCount < maxRetries) {
                console.log(`Deadlock detected on subtasks table update, retrying (${retryCount}/${maxRetries})...`);
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
            } else {
                console.error("Error updating subtasks table:", error);
                break;
            }
        }
    }
}

// Update tasks table to include progress column if it doesn't exist
async function updateTasksTable() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            // Check if task_progress column exists
            const [progressColumns] = await db.query("SHOW COLUMNS FROM tasks LIKE 'task_progress'");
            if (progressColumns.length === 0) {
                await db.query(`
                    ALTER TABLE tasks 
                    ADD COLUMN task_progress INT DEFAULT 0
                `);
                console.log("Tasks table updated with task_progress column");
            }
            break; // Success, exit retry loop
        } catch (error) {
            retryCount++;
            if (error.code === 'ER_LOCK_DEADLOCK' && retryCount < maxRetries) {
                console.log(`Deadlock detected on tasks table update, retrying (${retryCount}/${maxRetries})...`);
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
            } else {
                console.error("Error updating tasks table:", error);
                break;
            }
        }
    }
}

// Update projects table to include progress column if it doesn't exist
async function updateProjectsTableProgress() {
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
        try {
            // Check if proj_progress column exists
            const [progressColumns] = await db.query("SHOW COLUMNS FROM projects LIKE 'proj_progress'");
            if (progressColumns.length === 0) {
                await db.query(`
                    ALTER TABLE projects 
                    ADD COLUMN proj_progress INT DEFAULT 0
                `);
                console.log("Projects table updated with proj_progress column");
            }
            break; // Success, exit retry loop
        } catch (error) {
            retryCount++;
            if (error.code === 'ER_LOCK_DEADLOCK' && retryCount < maxRetries) {
                console.log(`Deadlock detected on projects table update, retrying (${retryCount}/${maxRetries})...`);
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                continue;
            } else {
                console.error("Error updating projects table:", error);
                break;
            }
        }
    }
}

// Sequential table initialization to avoid deadlocks
async function initializeTables() {
    console.log("Starting table initialization...");
    
    try {
        // Initialize tables in sequence to avoid deadlocks
        await createProgressLevelsTable();
        console.log("Progress levels table ready");
        
        await createTeamsTable();
        console.log("Teams table ready");
        
        await updateProjectsTable();
        console.log("Projects table ready");
        
        await updateProjectsTableProgress();
        console.log("Projects progress column ready");
        
        await createSubtasksTable();
        console.log("Subtasks table ready");
        
        await updateSubtasksTable();
        console.log("Subtasks columns updated");
        
        await updateTasksTable();
        console.log("Tasks table ready");
        
        await createSubtaskAssignmentTable();
        console.log("Subtask assignment table ready");
        
        await createSubtaskAttachmentTable();
        console.log("Subtask attachment table ready");
        
        // Fix foreign key constraints for existing tables
        await fixForeignKeyConstraints();
        console.log("Foreign key constraints fixed");
        
        console.log("All tables initialized successfully");
    } catch (error) {
        console.error("Error during table initialization:", error);
    }
}

// Initialize tables sequentially
initializeTables();

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
    console.log('🔍 Fetching teams for admin:', admin_user_id);

    try {
        // First check if the teams table exists
        const [tableCheck] = await db.query("SHOW TABLES LIKE 'teams'");
        console.log('🔍 Teams table check result:', tableCheck);
        
        if (tableCheck.length === 0) {
            console.error('❌ Teams table does not exist!');
            return res.status(500).json({ error: "Teams table does not exist", details: "Database schema not initialized" });
        }

        // Check if admin exists in employees table
        const [adminCheck] = await db.query("SELECT emp_user_id FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        console.log('🔍 Admin check result:', adminCheck);
        
        if (adminCheck.length === 0) {
            console.log('⚠️ Admin user not found in employees table:', admin_user_id);
        }

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
        console.log('🔍 Teams fetched:', teams.length);
        console.log('🔍 Teams data:', teams);
        res.json(teams);
    } catch (err) {
        console.error("❌ Fetch teams error:", err);
        console.error("❌ Error stack:", err.stack);
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

/**
 * ✅ GET /api/projects/tasks/:project_id
 * Fetch tasks for a specific project
 */
router.get("/tasks/:project_id", async (req, res) => {
    const { project_id } = req.params;
    try {
        const [tasks] = await db.query(
            `SELECT t.*, 
                CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') as employee_name
             FROM tasks t
             LEFT JOIN employees e ON t.task_employee_id = e.emp_id
             WHERE t.task_project_id = ?
             ORDER BY t.task_created_at DESC`,
            [project_id]
        );
        res.json(tasks);
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

/**
 * ✅ GET /api/projects/employees
 * Fetch only employees (IDs starting with 'emp') for autocomplete
 */
router.get("/employees", async (req, res) => {
    try {
        const [employees] = await db.query(
            `SELECT emp_id, emp_user_id, emp_first_name, emp_last_name 
             FROM employees 
             WHERE emp_user_id LIKE 'emp%' 
             ORDER BY emp_first_name, emp_last_name`
        );
        console.log('🔍 Backend: Found', employees.length, 'employees with emp IDs');
        res.json(employees);
    } catch (err) {
        console.error("Fetch employees error:", err);
        res.status(500).json({ error: "Failed to fetch employees" });
    }
});

/**
 * ✅ GET /api/projects/employee/teams/:employee_id
 * Get teams where employee is assigned to tasks/subtasks
 */
router.get("/employee/teams/:employee_id", async (req, res) => {
    const { employee_id } = req.params;
    
    console.log('🔍 Employee teams request for:', employee_id);
    
    try {
        // Get employee details
        const [empRows] = await db.query(
            "SELECT emp_id, emp_user_id, emp_first_name, emp_last_name FROM employees WHERE emp_user_id = ?",
            [employee_id]
        );
        
        console.log('🔍 Employee query result:', empRows);
        
        if (empRows.length === 0) {
            console.log('❌ Employee not found:', employee_id);
            return res.status(404).json({ error: "Employee not found" });
        }
        
        const employee = empRows[0];
        console.log('🔍 Found employee:', employee);
        
        // Get teams where employee has tasks or subtasks
        // Use emp_id (numeric) for assignments since that's how they're stored in the database
        const [teams] = await db.query(
            `SELECT DISTINCT tm.*, 
                    COUNT(DISTINCT p.proj_id) as project_count,
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as leader_name
             FROM teams tm
             LEFT JOIN employees e ON tm.team_leader_id = e.emp_user_id
             JOIN projects p ON tm.team_id = p.team_id
             LEFT JOIN tasks t ON p.proj_id = t.task_project_id
             LEFT JOIN subtasks s ON t.task_id = s.task_id
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             WHERE (t.task_employee_id = ? OR sa.employee_id = ? OR s.employee_id = ?)
             GROUP BY tm.team_id
             ORDER BY tm.team_created_at DESC`,
            [employee.emp_id, employee.emp_id, employee.emp_id]
        );
        
        console.log('🔍 Teams found for employee:', teams.length);
        
        res.json(teams);
    } catch (error) {
        console.error("Employee teams error:", error);
        res.status(500).json({ error: "Failed to fetch employee teams" });
    }
});

/**
 * ✅ GET /api/projects/employee/projects/:team_id/:employee_id
 * Get projects in a team where employee has tasks/subtasks
 */
router.get("/employee/projects/:team_id/:employee_id", async (req, res) => {
    const { team_id, employee_id } = req.params;
    
    try {
        // Get employee details
        const [empRows] = await db.query(
            "SELECT emp_id, emp_user_id FROM employees WHERE emp_user_id = ?",
            [employee_id]
        );
        
        if (empRows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        const employee = empRows[0];
        
        // Get projects where employee has tasks or subtasks
        // Use emp_id (numeric) for assignments since that's how they're stored in the database
        const [projects] = await db.query(
            `SELECT DISTINCT p.*, 
                    COUNT(DISTINCT t.task_id) as task_count
             FROM projects p
             JOIN tasks t ON p.proj_id = t.task_project_id
             LEFT JOIN subtasks s ON t.task_id = s.task_id
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             WHERE p.team_id = ? AND (t.task_employee_id = ? OR sa.employee_id = ? OR s.employee_id = ?)
             GROUP BY p.proj_id
             ORDER BY p.proj_created_at DESC`,
            [team_id, employee.emp_id, employee.emp_id, employee.emp_id]
        );
        
        res.json(projects);
    } catch (error) {
        console.error("Employee projects error:", error);
        res.status(500).json({ error: "Failed to fetch employee projects" });
    }
});

/**
 * ✅ GET /api/projects/employee/tasks/:project_id/:employee_id
 * Get tasks in a project assigned to employee
 */
router.get("/employee/tasks/:project_id/:employee_id", async (req, res) => {
    const { project_id, employee_id } = req.params;
    
    try {
        // Get employee details
        const [empRows] = await db.query(
            "SELECT emp_id, emp_user_id FROM employees WHERE emp_user_id = ?",
            [employee_id]
        );
        
        if (empRows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }
        
        const employee = empRows[0];
        
        // Get tasks assigned to employee OR tasks where employee has subtasks
        // Use emp_id (numeric) for assignments since that's how they're stored in the database
        const [tasks] = await db.query(
            `SELECT DISTINCT t.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as employee_name,
                    COUNT(DISTINCT s.subtask_id) as subtask_count
             FROM tasks t
             LEFT JOIN employees e ON t.task_employee_id = e.emp_user_id
             LEFT JOIN subtasks s ON t.task_id = s.task_id
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             WHERE t.task_project_id = ? AND (t.task_employee_id = ? OR sa.employee_id = ? OR s.employee_id = ?)
             GROUP BY t.task_id
             ORDER BY t.task_created_at DESC`,
            [project_id, employee.emp_id, employee.emp_id, employee.emp_id]
        );
        
        res.json(tasks);
    } catch (error) {
        console.error("Employee tasks error:", error);
        res.status(500).json({ error: "Failed to fetch employee tasks" });
    }
});

/**
 * ✅ GET /api/projects/employee-stats/:employee_id
 * Get employee-specific statistics (tasks, subtasks, etc.)
 */
router.get("/employee-stats/:employee_id", async (req, res) => {
    const { employee_id } = req.params;
    
    try {
        // Validate employee exists
        const [empRows] = await db.query("SELECT emp_user_id FROM employees WHERE emp_user_id = ?", [employee_id]);
        if (empRows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Get total tasks assigned to this employee
        const [taskCount] = await db.query(
            "SELECT COUNT(*) as total_tasks FROM tasks WHERE task_employee_id = ?",
            [employee_id]
        );

        // Get total subtasks assigned to this employee
        const [subtaskCount] = await db.query(
            "SELECT COUNT(*) as total_subtasks FROM subtask_assignment WHERE employee_id = ?",
            [employee_id]
        );

        // Get completed tasks count
        const [completedTasks] = await db.query(
            "SELECT COUNT(*) as completed_tasks FROM tasks WHERE task_employee_id = ? AND task_status = 2",
            [employee_id]
        );

        // Get completed subtasks count
        const [completedSubtasks] = await db.query(
            `SELECT COUNT(*) as completed_subtasks 
             FROM subtask_assignment sa 
             JOIN subtasks s ON sa.subtask_id = s.subtask_id 
             WHERE sa.employee_id = ? AND s.subtask_status = 2`,
            [employee_id]
        );

        // Calculate completion percentages
        const totalTasks = taskCount[0].total_tasks;
        const totalSubtasks = subtaskCount[0].total_subtasks;
        const completedTasksCount = completedTasks[0].completed_tasks;
        const completedSubtasksCount = completedSubtasks[0].completed_subtasks;

        const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;
        const subtaskCompletionRate = totalSubtasks > 0 ? Math.round((completedSubtasksCount / totalSubtasks) * 100) : 0;

        res.json({
            success: true,
            stats: {
                total_tasks: totalTasks,
                total_subtasks: totalSubtasks,
                completed_tasks: completedTasksCount,
                completed_subtasks: completedSubtasksCount,
                task_completion_rate: taskCompletionRate,
                subtask_completion_rate: subtaskCompletionRate
            }
        });
    } catch (error) {
        console.error("Employee stats error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ GET /api/projects/employee-tasks/:employee_id
 * Get all tasks assigned to a specific employee
 */
router.get("/employee-tasks/:employee_id", async (req, res) => {
    const { employee_id } = req.params;
    
    try {
        // Validate employee exists
        const [empRows] = await db.query("SELECT emp_user_id FROM employees WHERE emp_user_id = ?", [employee_id]);
        if (empRows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Get all tasks assigned to this employee with project details
        const [tasks] = await db.query(
            `SELECT t.*, p.proj_name, p.proj_client,
                    CASE 
                        WHEN t.task_status = 1 THEN 'in-progress'
                        WHEN t.task_status = 2 THEN 'completed'
                        ELSE 'pending'
                    END as status_text,
                    CASE 
                        WHEN t.task_priority = 'High' THEN 'high'
                        WHEN t.task_priority = 'Medium' THEN 'medium'
                        ELSE 'low'
                    END as priority_text
             FROM tasks t 
             LEFT JOIN projects p ON t.task_project_id = p.proj_id 
             WHERE t.task_employee_id = ?
             ORDER BY t.task_created_at DESC`,
            [employee_id]
        );

        res.json({
            success: true,
            tasks: tasks
        });
    } catch (error) {
        console.error("Employee tasks error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Test route to verify router is working
router.get("/test", (req, res) => {
    console.log('🔍 Backend: Test route hit');
    res.json({ message: "Projects router is working!" });
});

// Test route to check table existence
router.get("/test-tables", async (req, res) => {
    try {
        const tables = ['subtasks', 'subtask_assignment', 'subtask_attachment'];
        const results = {};
        
        for (const table of tables) {
            try {
                const [rows] = await db.query(`SHOW TABLES LIKE '${table}'`);
                results[table] = rows.length > 0 ? 'exists' : 'missing';
            } catch (err) {
                results[table] = 'error: ' + err.message;
            }
        }
        
        res.json({ 
            message: "Table check completed", 
            tables: results 
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to check tables", details: error.message });
    }
});

// --- Notification helpers ---
const dbPool = require('../db');

async function addNotification({ user_id, type, message, link }) {
    await dbPool.query(
        `INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)`,
        [user_id, type, message, link]
    );
}

// --- Notification endpoints ---
router.get('/notifications/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        const [rows] = await dbPool.query(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
            [user_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Notification fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

router.post('/notifications/mark-read/:notification_id', async (req, res) => {
    const { notification_id } = req.params;
    try {
        await dbPool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
            [notification_id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Notification mark-read error:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// --- Employee submits a task ---
router.post('/submit-task', async (req, res) => {
    const { task_id, completion_feedback, employee_id } = req.body;
    try {
        // Validate employee
        const [empRows] = await db.query(
            "SELECT emp_id, emp_user_id, emp_first_name, emp_last_name FROM employees WHERE emp_user_id = ?",
            [employee_id]
        );
        if (empRows.length === 0) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
        const employee = empRows[0];

        // Validate task and get project/team info
        const [taskRows] = await db.query(
            `SELECT t.*, p.proj_name, p.team_id, tm.team_name, tm.team_created_by 
             FROM tasks t 
             JOIN projects p ON t.task_project_id = p.proj_id 
             JOIN teams tm ON p.team_id = tm.team_id 
             WHERE t.task_id = ?`,
            [task_id]
        );
        if (taskRows.length === 0) {
            return res.status(404).json({ success: false, error: "Task not found" });
        }
        const task = taskRows[0];

        // Mark task as completed
        await db.query(
            `UPDATE tasks SET task_status = 2, task_progress = 100, task_completion_feedback = ?, task_completed_at = NOW(), task_updated_at = NOW() WHERE task_id = ?`,
            [completion_feedback, task_id]
        );

        // Update project progress
        await updateTaskProgress(task_id);

        // Notify admin/manager
        const adminUserId = task.team_created_by;
        const employeeName = `${employee.emp_first_name} ${employee.emp_last_name}`;
        await addNotification({
            user_id: adminUserId,
            type: 'task_completed',
            message: `${employeeName} completed the task: ${task.task_name}. Tap to view.`,
            link: `/Admin/projects.html?task_id=${task_id}`
        });

        res.json({ success: true, message: "Task submitted and marked as complete." });
    } catch (error) {
        console.error("Task submission error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

// Add admin feedback to subtask
router.post('/subtask-feedback/:subtaskId', async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { feedback, admin_user_id } = req.body;

        if (!feedback || !admin_user_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Feedback and admin user ID are required' 
            });
        }

        // Update subtask with admin feedback
        await db.query(`
            UPDATE subtasks 
            SET subtask_completion_feedback = ?, 
                subtask_updated_at = NOW() 
            WHERE subtask_id = ?
        `, [feedback, subtaskId]);

        // Add notification for employee
        const [subtaskData] = await db.query(`
            SELECT s.employee_id, s.subtask_name, t.task_name, p.proj_name
            FROM subtasks s
            JOIN tasks t ON s.task_id = t.task_id
            JOIN projects p ON t.project_id = p.project_id
            WHERE s.subtask_id = ?
        `, [subtaskId]);

        if (subtaskData.length > 0 && subtaskData[0].employee_id) {
            await addNotification({
                user_id: subtaskData[0].employee_id,
                type: 'feedback',
                message: `Admin provided feedback on your submitted subtask: ${subtaskData[0].subtask_name}`,
                link: `/Employee/projects.html`
            });
        }

        res.json({ 
            success: true, 
            message: 'Feedback added successfully' 
        });

    } catch (error) {
        console.error('Error adding subtask feedback:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding feedback' 
        });
    }
});

// Reopen completed subtask
router.post('/reopen-subtask/:subtaskId', async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const { admin_user_id } = req.body;

        if (!admin_user_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Admin user ID is required' 
            });
        }

        // Update subtask status back to active
        await db.query(`
            UPDATE subtasks 
            SET subtask_status = 1, 
                subtask_updated_at = NOW() 
            WHERE subtask_id = ?
        `, [subtaskId]);

        // Add notification for employee
        const [subtaskData] = await db.query(`
            SELECT s.employee_id, s.subtask_name, t.task_name, p.proj_name
            FROM subtasks s
            JOIN tasks t ON s.task_id = t.task_id
            JOIN projects p ON t.project_id = p.project_id
            WHERE s.subtask_id = ?
        `, [subtaskId]);

        if (subtaskData.length > 0 && subtaskData[0].employee_id) {
            await addNotification({
                user_id: subtaskData[0].employee_id,
                type: 'subtask_reopened',
                message: `Your subtask "${subtaskData[0].subtask_name}" has been reopened by admin. Please review and resubmit.`,
                link: `/Employee/projects.html`
            });
        }

        res.json({ 
            success: true, 
            message: 'Subtask reopened successfully' 
        });

    } catch (error) {
        console.error('Error reopening subtask:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error reopening subtask' 
        });
    }
});

// Helper function to update task progress
async function updateTaskProgress(taskId) {
    try {
        // Get all subtasks for the task
        const [subtasks] = await db.query(
            "SELECT subtask_progress FROM subtasks WHERE task_id = ?",
            [taskId]
        );
        
        if (subtasks.length === 0) return;
        
        // Calculate average progress
        const totalProgress = subtasks.reduce((sum, subtask) => sum + (subtask.subtask_progress || 0), 0);
        const averageProgress = Math.round(totalProgress / subtasks.length);
        
        // Update task progress
        await db.query(
            "UPDATE tasks SET task_progress = ? WHERE task_id = ?",
            [averageProgress, taskId]
        );
        
        // Update project progress
        const [taskRows] = await db.query(
            "SELECT task_project_id FROM tasks WHERE task_id = ?",
            [taskId]
        );
        
        if (taskRows.length > 0) {
            const projectId = taskRows[0].task_project_id;
            
            // Get all tasks for the project
            const [projectTasks] = await db.query(
                "SELECT task_progress FROM tasks WHERE task_project_id = ?",
                [projectId]
            );
            
            if (projectTasks.length > 0) {
                const totalProjectProgress = projectTasks.reduce((sum, task) => sum + (task.task_progress || 0), 0);
                const averageProjectProgress = Math.round(totalProjectProgress / projectTasks.length);
                
                await db.query(
                    "UPDATE projects SET proj_progress = ? WHERE proj_id = ?",
                    [averageProjectProgress, projectId]
                );
            }
        }
    } catch (error) {
        console.error("Update progress error:", error);
    }
}

/**
 * POST /api/projects/create-subtask
 * Create a new subtask and assign to selected employees only (using emp_user_id)
 */
router.post("/create-subtask", upload.array('attachments'), async (req, res) => {
    const {
        subtask_name,
        subtask_description,
        task_id,
        employee_ids,
        subtask_deadline,
        subtask_priority,
        admin_user_id
    } = req.body;
    const files = req.files || [];

    try {
        // Validate task exists and get project/team info
        const [taskRows] = await db.query(
            `SELECT t.*, p.proj_name, p.team_id, tm.team_name, tm.team_created_by 
             FROM tasks t 
             JOIN projects p ON t.task_project_id = p.proj_id 
             JOIN teams tm ON p.team_id = tm.team_id 
             WHERE t.task_id = ?`,
            [task_id]
        );
        if (taskRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid task ID" });
        }
        const task = taskRows[0];
        const { proj_name, team_name, team_created_by } = task;

        // Parse employee IDs
        let employeeIdsArray = [];
        if (employee_ids) {
            try {
                employeeIdsArray = JSON.parse(employee_ids);
            } catch (e) {
                employeeIdsArray = employee_ids.split(',').map(id => id.trim());
            }
        }
        if (!Array.isArray(employeeIdsArray) || employeeIdsArray.length === 0) {
            return res.status(400).json({ success: false, error: "No employees selected" });
        }

        // Convert emp_user_id to emp_id for all selected employees
        let employeeDbIds = [];
        for (const empUserId of employeeIdsArray) {
            const [empRows] = await db.query(
                "SELECT emp_id, emp_user_id FROM employees WHERE emp_user_id = ?",
                [empUserId]
            );
            if (empRows.length === 0) {
                return res.status(400).json({ success: false, error: `Invalid employee ID: ${empUserId}` });
            }
            employeeDbIds.push({ emp_id: empRows[0].emp_id, emp_user_id: empRows[0].emp_user_id });
        }

        // Create S3 folder structure: admin_id/team_name/project_name/task_name/subtask_name/
        const s3FolderPath = `${team_created_by}/${team_name}/${proj_name}/${task.task_name}/${subtask_name}`;
        await createS3Folder(s3FolderPath);

        // Insert subtask into database
        // If only one employee, set employee_id (emp_id), else set to NULL
        let primaryEmployeeDbId = null;
        if (employeeDbIds.length === 1) {
            primaryEmployeeDbId = employeeDbIds[0].emp_id;
        }
        const [result] = await db.query(
            `INSERT INTO subtasks 
            (subtask_name, subtask_description, task_id, employee_id, subtask_status, subtask_priority, subtask_deadline, subtask_created_at, subtask_updated_at) 
            VALUES (?, ?, ?, ?, 1, ?, ?, NOW(), NOW())`,
            [subtask_name, subtask_description, task_id, primaryEmployeeDbId, subtask_priority, subtask_deadline]
        );
        const subtask_id = result.insertId;

        // Insert employee assignments ONLY for selected employees (using emp_id)
        for (const emp of employeeDbIds) {
            await db.query(
                `INSERT INTO subtask_assignment 
                (subtask_id, employee_id, subass_assigned_at, subass_updated_at) 
                VALUES (?, ?, NOW(), NOW())`,
                [subtask_id, emp.emp_id]
            );
        }

        // Upload files to S3 and store metadata (admin uploads only)
        const uploadedFiles = [];
        for (const file of files) {
            try {
                const s3Url = await uploadFileToS3(s3FolderPath, file);
                await db.query(
                    `INSERT INTO subtask_attachment 
                    (subatt_subtask_id, subatt_file_name, subatt_file_type, subatt_file_path, subatt_uploaded_by, subatt_created_at, subatt_updated_at) 
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                    [subtask_id, file.originalname, file.mimetype, s3Url, admin_user_id]
                );
                uploadedFiles.push({
                    name: file.originalname,
                    type: file.mimetype,
                    url: s3Url
                });
            } catch (uploadError) {
                console.error("File upload error:", uploadError);
            }
        }

        // Notify only assigned employees (use emp_user_id for notification)
        for (const emp of employeeDbIds) {
            await addNotification({
                user_id: emp.emp_user_id,
                type: 'subtask_assigned',
                message: `New Subtask assigned: ${subtask_name}. Tap to view.`,
                link: `/Employee/projects.html?subtask_id=${subtask_id}`
            });
        }

        // Fetch the created subtask with employee details
        const [subtaskRows] = await db.query(
            `SELECT s.*, 
                    GROUP_CONCAT(CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') SEPARATOR ', ') as assigned_employees
             FROM subtasks s 
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             LEFT JOIN employees e ON sa.employee_id = e.emp_id
             WHERE s.subtask_id = ?
             GROUP BY s.subtask_id`,
            [subtask_id]
        );

        res.json({ 
            success: true, 
            message: "Subtask created successfully",
            subtask: subtaskRows[0],
            uploadedFiles: uploadedFiles
        });
    } catch (error) {
        console.error("Subtask creation error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * GET /api/projects/subtasks/:task_id
 * Fetch all subtasks for a given task, with correct assigned_employees field
 */
router.get("/subtasks/:task_id", async (req, res) => {
    const { task_id } = req.params;
    try {
        const [subtasks] = await db.query(
            `SELECT s.*, 
                CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') as primary_employee,
                GROUP_CONCAT(CONCAT(e2.emp_first_name, ' ', e2.emp_last_name, ' (', e2.emp_user_id, ')') SEPARATOR ', ') as assigned_employees
             FROM subtasks s
             LEFT JOIN employees e ON s.employee_id = e.emp_id
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             LEFT JOIN employees e2 ON sa.employee_id = e2.emp_user_id
             WHERE s.task_id = ?
             GROUP BY s.subtask_id
             ORDER BY s.subtask_created_at DESC`,
            [task_id]
        );
        res.json(subtasks);
    } catch (error) {
        console.error("Fetch subtasks error:", error);
        res.status(500).json({ error: "Failed to fetch subtasks" });
    }
});

/**
 * GET /api/projects/employee/subtasks/:task_id/:employee_id
 * Fetch subtasks for a specific task that are assigned to a specific employee
 */
router.get("/employee/subtasks/:task_id/:employee_id", async (req, res) => {
    const { task_id, employee_id } = req.params;
    
    try {
        // Validate employee exists
        const [empRows] = await db.query("SELECT emp_user_id FROM employees WHERE emp_user_id = ?", [employee_id]);
        if (empRows.length === 0) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Get subtasks for this task that are assigned to this employee
        const [subtasks] = await db.query(
            `SELECT s.*, 
                GROUP_CONCAT(CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') SEPARATOR ', ') as assigned_employees,
                CASE 
                    WHEN s.subtask_status = 1 THEN 'Pending'
                    WHEN s.subtask_status = 2 THEN 'In Progress'
                    WHEN s.subtask_status = 3 THEN 'Completed'
                    WHEN s.subtask_status = 4 THEN 'On Hold'
                    WHEN s.subtask_status = 5 THEN 'Cancelled'
                    ELSE 'Unknown'
                END as status_text,
                CASE 
                    WHEN s.subtask_priority = 'High' THEN 'high'
                    WHEN s.subtask_priority = 'Medium' THEN 'medium'
                    ELSE 'low'
                END as priority_text
             FROM subtasks s
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             LEFT JOIN employees e ON sa.employee_id = e.emp_user_id
             WHERE s.task_id = ? AND (sa.employee_id = ? OR s.employee_id = ?)
             GROUP BY s.subtask_id
             ORDER BY s.subtask_created_at DESC`,
            [task_id, employee_id, employee_id]
        );
        
        res.json(subtasks);
    } catch (error) {
        console.error("Fetch employee subtasks error:", error);
        res.status(500).json({ error: "Failed to fetch employee subtasks" });
    }
});

/**
 * GET /api/projects/subtask/:subtask_id
 * Fetch a single subtask with assigned employee name
 */
router.get('/subtask/:subtask_id', async (req, res) => {
    const { subtask_id } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT s.*, 
                CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') as primary_employee,
                GROUP_CONCAT(CONCAT(e2.emp_first_name, ' ', e2.emp_last_name, ' (', e2.emp_user_id, ')') SEPARATOR ', ') as assigned_employees
             FROM subtasks s
             LEFT JOIN employees e ON s.employee_id = e.emp_id
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             LEFT JOIN employees e2 ON sa.employee_id = e2.emp_user_id
             WHERE s.subtask_id = ?
             GROUP BY s.subtask_id`,
            [subtask_id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Subtask not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Fetch subtask error:', error);
        res.status(500).json({ error: 'Failed to fetch subtask' });
    }
});

/**
 * DELETE /api/projects/delete-subtask/:subtask_id
 * Delete a subtask and all its assignments/attachments (DB + S3)
 */
router.delete("/delete-subtask/:subtask_id", async (req, res) => {
    const { subtask_id } = req.params;
    const { admin_user_id } = req.body;
    try {
        // Validate admin user
        if (!admin_user_id) {
            return res.status(400).json({ success: false, error: "Admin user ID required" });
        }
        // Get subtask details for notifications and S3 path
        const [subtaskRows] = await db.query(
            `SELECT s.*, t.task_name, p.proj_name, tm.team_name, p.proj_created_by
             FROM subtasks s 
             JOIN tasks t ON s.task_id = t.task_id 
             JOIN projects p ON t.task_project_id = p.proj_id 
             JOIN teams tm ON p.team_id = tm.team_id
             WHERE s.subtask_id = ?`,
            [subtask_id]
        );
        if (subtaskRows.length === 0) {
            return res.status(404).json({ success: false, error: "Subtask not found" });
        }
        const subtask = subtaskRows[0];
        // Get assigned employees for notifications
        const [assignmentRows] = await db.query(
            `SELECT sa.employee_id FROM subtask_assignment sa WHERE sa.subtask_id = ?`,
            [subtask_id]
        );
        // 1. Delete all attachments (DB + S3)
        const [attachments] = await db.query(
            `SELECT subatt_id, subatt_file_path FROM subtask_attachment WHERE subatt_subtask_id = ?`,
            [subtask_id]
        );
        for (const att of attachments) {
            // Delete file from S3
            if (att.subatt_file_path) {
                try {
                    // Extract S3 key from URL
                    const url = new URL(att.subatt_file_path);
                    const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                    await deleteS3Folder(key.substring(0, key.lastIndexOf('/'))); // delete folder containing the file
                } catch (e) { console.error('S3 file delete error:', e); }
            }
        }
        // Delete attachment records from DB
        await db.query(`DELETE FROM subtask_attachment WHERE subatt_subtask_id = ?`, [subtask_id]);
        // 2. Delete the subtask (cascades to assignments)
        await db.query("DELETE FROM subtasks WHERE subtask_id = ?", [subtask_id]);
        // 3. Delete the S3 folder for the subtask
        const s3Path = `${subtask.proj_created_by}/${subtask.team_name}/${subtask.proj_name}/${subtask.task_name}/${subtask.subtask_name}`;
        try { await deleteS3Folder(s3Path); } catch (e) { console.error('S3 delete error:', e); }
        // 4. Notify assigned employees
        for (const assignment of assignmentRows) {
            await addNotification({
                user_id: assignment.employee_id,
                type: 'subtask_deleted',
                message: `Subtask "${subtask.subtask_name}" has been deleted by admin.`,
                link: `/Employee/projects.html`
            });
        }
        res.json({ success: true, message: "Subtask deleted successfully" });
    } catch (error) {
        console.error("Delete subtask error:", error);
        res.status(500).json({ success: false, error: "Failed to delete subtask" });
    }
});

/**
 * POST /api/projects/delete-subtasks
 * Bulk delete subtasks (DB + S3)
 * Body: { subtask_ids: [1,2,3,...] }
 */
router.post('/delete-subtasks', async (req, res) => {
    const { subtask_ids } = req.body;
    if (!Array.isArray(subtask_ids) || subtask_ids.length === 0) {
        return res.status(400).json({ success: false, error: 'No subtask IDs provided' });
    }
    let deleted = 0, failed = 0, errors = [];
    for (const subtask_id of subtask_ids) {
        try {
            // Get subtask details for S3 path
            const [rows] = await db.query(`
                SELECT s.subtask_id, s.subtask_name, t.task_name, p.proj_name, tm.team_name, p.proj_created_by
                FROM subtasks s
                JOIN tasks t ON s.task_id = t.task_id
                JOIN projects p ON t.task_project_id = p.proj_id
                JOIN teams tm ON p.team_id = tm.team_id
                WHERE s.subtask_id = ?
            `, [subtask_id]);
            if (!rows.length) { failed++; errors.push(`Subtask ${subtask_id} not found`); continue; }
            const subtask = rows[0];
            // Delete all attachments (DB + S3)
            const [attachments] = await db.query(
                `SELECT subatt_id, subatt_file_path FROM subtask_attachment WHERE subatt_subtask_id = ?`,
                [subtask_id]
            );
            for (const att of attachments) {
                if (att.subatt_file_path) {
                    try {
                        const url = new URL(att.subatt_file_path);
                        const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                        await deleteS3Folder(key.substring(0, key.lastIndexOf('/')));
                    } catch (e) { console.error('S3 file delete error:', e); }
                }
            }
            await db.query(`DELETE FROM subtask_attachment WHERE subatt_subtask_id = ?`, [subtask_id]);
            // Delete from DB (cascades to assignments)
            await db.query('DELETE FROM subtasks WHERE subtask_id = ?', [subtask_id]);
            // S3 path: admin_id/team_name/project_name/task_name/subtask_name
            const s3Path = `${subtask.proj_created_by}/${subtask.team_name}/${subtask.proj_name}/${subtask.task_name}/${subtask.subtask_name}`;
            try { await deleteS3Folder(s3Path); } catch (e) { console.error('S3 delete error:', e); }
            deleted++;
        } catch (err) {
            failed++;
            errors.push(`Subtask ${subtask_id}: ${err.message}`);
        }
    }
    res.json({ success: true, deleted, failed, errors });
});

/**
 * PUT /api/projects/update-subtask/:subtask_id
 * Update subtask details, assigned employees, and attachments
 * Accepts multipart/form-data for attachments
 */
router.put('/update-subtask/:subtask_id', upload.array('attachments'), async (req, res) => {
    const { subtask_id } = req.params;
    const {
        subtask_name,
        subtask_description,
        subtask_deadline,
        subtask_priority,
        employee_ids, // JSON array or comma-separated
        admin_user_id,
        removed_attachment_ids // JSON array of subatt_id to delete
    } = req.body;
    const files = req.files || [];
    try {
        // 1. Update subtask fields
        await db.query(
            `UPDATE subtasks SET subtask_name=?, subtask_description=?, subtask_deadline=?, subtask_priority=?, subtask_updated_at=NOW() WHERE subtask_id=?`,
            [subtask_name, subtask_description, subtask_deadline, subtask_priority, subtask_id]
        );
        // 2. Update assigned employees
        let employeeIdsArray = [];
        if (employee_ids) {
            try { employeeIdsArray = JSON.parse(employee_ids); } catch { employeeIdsArray = employee_ids.split(',').map(id => id.trim()); }
        }
        if (Array.isArray(employeeIdsArray) && employeeIdsArray.length > 0) {
            // Remove old assignments
            await db.query(`DELETE FROM subtask_assignment WHERE subtask_id = ?`, [subtask_id]);
            // Add new assignments
            for (const empUserId of employeeIdsArray) {
                await db.query(
                    `INSERT INTO subtask_assignment (subtask_id, employee_id, subass_assigned_at, subass_updated_at) VALUES (?, ?, NOW(), NOW())`,
                    [subtask_id, empUserId]
                );
            }
        }
        // 3. Remove deleted attachments (DB + S3)
        if (removed_attachment_ids) {
            let ids = [];
            try { ids = JSON.parse(removed_attachment_ids); } catch { ids = removed_attachment_ids.split(',').map(x => x.trim()); }
            if (ids.length > 0) {
                const [rows] = await db.query(`SELECT subatt_id, subatt_file_path FROM subtask_attachment WHERE subatt_id IN (${ids.map(() => '?').join(',')})`, ids);
                for (const att of rows) {
                    if (att.subatt_file_path) {
                        try {
                            const url = new URL(att.subatt_file_path);
                            const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
                            await deleteS3Folder(key.substring(0, key.lastIndexOf('/')));
                        } catch (e) { console.error('S3 file delete error:', e); }
                    }
                }
                await db.query(`DELETE FROM subtask_attachment WHERE subatt_id IN (${ids.map(() => '?').join(',')})`, ids);
            }
        }
        // 4. Upload new attachments (admin uploads only)
        // Get S3 folder path
        const [subtaskRow] = await db.query(
            `SELECT s.*, t.task_name, p.proj_name, tm.team_name, tm.team_created_by FROM subtasks s JOIN tasks t ON s.task_id = t.task_id JOIN projects p ON t.task_project_id = p.proj_id JOIN teams tm ON p.team_id = tm.team_id WHERE s.subtask_id = ?`,
            [subtask_id]
        );
        if (subtaskRow.length > 0 && files.length > 0) {
            const s3FolderPath = `${subtaskRow[0].team_created_by}/${subtaskRow[0].team_name}/${subtaskRow[0].proj_name}/${subtaskRow[0].task_name}/${subtaskRow[0].subtask_name}`;
            for (const file of files) {
                try {
                    const s3Url = await uploadFileToS3(s3FolderPath, file);
                    await db.query(
                        `INSERT INTO subtask_attachment (subatt_subtask_id, subatt_file_name, subatt_file_type, subatt_file_path, subatt_uploaded_by, subatt_created_at, subatt_updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                        [subtask_id, file.originalname, file.mimetype, s3Url, admin_user_id]
                    );
                } catch (uploadError) { console.error('File upload error:', uploadError); }
            }
        }
        // 5. Return updated subtask
        const [subtaskRows] = await db.query(
            `SELECT s.*, GROUP_CONCAT(CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') SEPARATOR ', ') as assigned_employees FROM subtasks s LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id LEFT JOIN employees e ON sa.employee_id = e.emp_id WHERE s.subtask_id = ? GROUP BY s.subtask_id`,
            [subtask_id]
        );
        res.json({ success: true, message: 'Subtask updated successfully', subtask: subtaskRows[0] });
    } catch (error) {
        console.error('Update subtask error:', error);
        res.status(500).json({ success: false, error: 'Failed to update subtask' });
    }
});

module.exports = router;