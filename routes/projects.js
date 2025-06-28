// routes/projects.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../db"); //  DB pool
const { createS3Folder, uploadFileToS3 } = require("../utils/s3Utils");
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
                FOREIGN KEY (subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE,
                FOREIGN KEY (employee_id) REFERENCES employees(emp_user_id) ON DELETE CASCADE
            )
        `);
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
                FOREIGN KEY (subatt_subtask_id) REFERENCES subtasks(subtask_id) ON DELETE CASCADE,
                FOREIGN KEY (subatt_uploaded_by) REFERENCES employees(emp_user_id) ON DELETE SET NULL
            )
        `);
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

/**
 * ✅ POST /api/projects/create-task
 * Create new task with S3 folder structure: admin_id/team_name/project_name/task_name/
 */
router.post("/create-task", async (req, res) => {
    const {
        task_name,
        task_description,
        task_priority,
        task_employee_id,
        task_deadline,
        project_id,
        admin_user_id
    } = req.body;

    try {
        // Validate project exists and get project details
        const [projectRows] = await db.query(
            `SELECT p.*, t.team_name, t.team_created_by 
             FROM projects p 
             JOIN teams t ON p.team_id = t.team_id 
             WHERE p.proj_id = ?`,
            [project_id]
        );
        
        if (projectRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid project ID" });
        }
        
        const project = projectRows[0];
        
        // Validate employee exists and get the emp_id (not emp_user_id)
        const [employeeRows] = await db.query(
            "SELECT emp_id, emp_user_id, emp_first_name, emp_last_name FROM employees WHERE emp_user_id = ? AND emp_user_id LIKE 'emp%'",
            [task_employee_id]
        );
        
        if (employeeRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid employee ID or not an employee" });
        }

        const employee = employeeRows[0];
        const employeeEmpId = employee.emp_id; // Use emp_id for foreign key

        // Create S3 folder structure: admin_id/team_name/project_name/task_name/
        const s3FolderPath = `${admin_user_id}/${project.team_name}/${project.proj_name}/${task_name}`;
        await createS3Folder(s3FolderPath);

        // Insert task into database using emp_id for foreign key
        const [result] = await db.query(
            `INSERT INTO tasks 
            (task_project_id, task_employee_id, task_name, task_description, task_status, task_created_at, task_updated_at) 
            VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
            [project_id, employeeEmpId, task_name, task_description]
        );

        const taskId = result.insertId;

        // Fetch the created task with employee details
        const [taskRows] = await db.query(
            `SELECT t.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as employee_name,
                    e.emp_user_id as employee_user_id
             FROM tasks t 
             LEFT JOIN employees e ON t.task_employee_id = e.emp_user_id 
             WHERE t.task_id = ?`,
            [taskId]
        );

        res.json({ 
            success: true, 
            message: "Task created successfully",
            task: taskRows[0]
        });
    } catch (error) {
        console.error("Task creation error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ GET /api/projects/tasks/:project_id
 * Fetch tasks for a specific project
 */
router.get("/tasks/:project_id", async (req, res) => {
    const { project_id } = req.params;
    console.log('🔍 Backend: Fetching tasks for project_id:', project_id);
    
    try {
        const [tasks] = await db.query(
            `SELECT t.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as employee_name,
                    e.emp_user_id as employee_user_id
             FROM tasks t 
             LEFT JOIN employees e ON t.task_employee_id = e.emp_user_id 
             WHERE t.task_project_id = ? 
             ORDER BY t.task_created_at DESC`,
            [project_id]
        );
        console.log('🔍 Backend: Found', tasks.length, 'tasks for project', project_id);
        res.json(tasks);
    } catch (err) {
        console.error("❌ Backend: Fetch tasks error:", err);
        res.status(500).json({ error: "Failed to fetch tasks for project" });
    }
});

/**
 * ✅ GET /api/projects/employees
 * Fetch only employees (IDs starting with 'emp') for autocomplete
 */
router.get("/employees", async (req, res) => {
    try {
        const [employees] = await db.query(
            `SELECT emp_user_id, emp_first_name, emp_last_name 
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
 * ✅ POST /api/projects/create-subtask
 * Create new subtask with file attachments
 * S3 folder structure: admin_id/team_name/project_name/task_name/subtask_name/
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

        // Validate employees exist
        for (const empId of employeeIdsArray) {
            const [empRows] = await db.query(
                "SELECT emp_id FROM employees WHERE emp_user_id = ?",
                [empId]
            );
            if (empRows.length === 0) {
                return res.status(400).json({ success: false, error: `Invalid employee ID: ${empId}` });
            }
        }

        // Create S3 folder structure: admin_id/team_name/project_name/task_name/subtask_name/
        const s3FolderPath = `${team_created_by}/${team_name}/${proj_name}/${task.task_name}/${subtask_name}`;
        await createS3Folder(s3FolderPath);

        // Insert subtask into database
        // Get the emp_id of the first assigned employee to store in subtasks table
        let primaryEmployeeId = null;
        if (employeeIdsArray.length > 0) {
            const [empRows] = await db.query(
                "SELECT emp_id FROM employees WHERE emp_user_id = ?",
                [employeeIdsArray[0]]
            );
            if (empRows.length > 0) {
                primaryEmployeeId = empRows[0].emp_id;
            }
        }

        const [result] = await db.query(
            `INSERT INTO subtasks 
            (subtask_name, subtask_description, task_id, employee_id, subtask_status, subtask_priority, subtask_deadline, subtask_created_at, subtask_updated_at) 
            VALUES (?, ?, ?, ?, 1, ?, ?, NOW(), NOW())`,
            [subtask_name, subtask_description, task_id, primaryEmployeeId, subtask_priority, subtask_deadline]
        );

        const subtask_id = result.insertId;

        // Insert employee assignments
        for (const empId of employeeIdsArray) {
            // Insert emp_user_id (string) directly, not emp_id (numeric)
            await db.query(
                `INSERT INTO subtask_assignment 
                (subtask_id, employee_id, subass_assigned_at, subass_updated_at) 
                VALUES (?, ?, NOW(), NOW())`,
                [subtask_id, empId]
            );
        }

        // Upload files to S3 and store metadata
        const uploadedFiles = [];
        for (const file of files) {
            try {
                const s3Url = await uploadFileToS3(s3FolderPath, file);
                
                // Store file metadata in database
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
                // Continue with other files even if one fails
            }
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
 * ✅ GET /api/projects/subtasks/:task_id
 * Fetch subtasks for a specific task
 */
router.get("/subtasks/:task_id", async (req, res) => {
    const { task_id } = req.params;
    console.log('🔍 Backend: Fetching subtasks for task_id:', task_id);
    
    try {
        // First check if the task exists
        const [taskCheck] = await db.query("SELECT task_id FROM tasks WHERE task_id = ?", [task_id]);
        if (taskCheck.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        // Fetch ALL subtasks for this task (for admin/manager view)
        const [subtasks] = await db.query(
            `SELECT DISTINCT s.*, 
                    GROUP_CONCAT(CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') SEPARATOR ', ') as assigned_employees
             FROM subtasks s 
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             LEFT JOIN employees e ON (sa.employee_id = e.emp_id OR s.employee_id = e.emp_id)
             WHERE s.task_id = ?
             GROUP BY s.subtask_id
             ORDER BY s.subtask_created_at DESC`,
            [task_id]
        );
        console.log('🔍 Backend: Found', subtasks.length, 'subtasks for task', task_id);
        res.json(subtasks);
    } catch (err) {
        console.error("❌ Backend: Fetch subtasks error:", err);
        res.status(500).json({ error: "Failed to fetch subtasks for task" });
    }
});

/**
 * ✅ GET /api/projects/subtask-attachments/:subtask_id
 * Fetch attachments for a specific subtask
 */
router.get("/subtask-attachments/:subtask_id", async (req, res) => {
    const { subtask_id } = req.params;
    
    try {
        const [attachments] = await db.query(
            `SELECT sa.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as uploaded_by_name
             FROM subtask_attachment sa 
             LEFT JOIN employees e ON sa.subatt_uploaded_by = e.emp_user_id 
             WHERE sa.subatt_subtask_id = ? 
             ORDER BY sa.subatt_created_at DESC`,
            [subtask_id]
        );
        res.json(attachments);
    } catch (err) {
        console.error("Fetch subtask attachments error:", err);
        res.status(500).json({ error: "Failed to fetch subtask attachments" });
    }
});

/**
 * ✅ POST /api/projects/upload-subtask-attachments
 * Upload additional attachments to an existing subtask
 */
router.post("/upload-subtask-attachments", upload.array('attachments'), async (req, res) => {
    const { subtask_id, admin_user_id } = req.body;
    const files = req.files || [];

    try {
        // Validate subtask exists and get task/project/team info
        const [subtaskRows] = await db.query(
            `SELECT s.*, t.task_name, p.proj_name, tm.team_name, tm.team_created_by 
             FROM subtasks s 
             JOIN tasks t ON s.task_id = t.task_id 
             JOIN projects p ON t.task_project_id = p.proj_id 
             JOIN teams tm ON p.team_id = tm.team_id 
             WHERE s.subtask_id = ?`,
            [subtask_id]
        );
        
        if (subtaskRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid subtask ID" });
        }
        
        const subtask = subtaskRows[0];
        const { task_name, proj_name, team_name, team_created_by, subtask_name } = subtask;

        // Create S3 folder structure: admin_id/team_name/project_name/task_name/subtask_name/
        const s3FolderPath = `${team_created_by}/${team_name}/${proj_name}/${task_name}/${subtask_name}`;
        await createS3Folder(s3FolderPath);

        // Upload files to S3 and store metadata
        const uploadedFiles = [];
        for (const file of files) {
            try {
                const s3Url = await uploadFileToS3(s3FolderPath, file);
                
                // Store file metadata in database
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
                // Continue with other files even if one fails
            }
        }

        res.json({ 
            success: true, 
            message: "Files uploaded successfully",
            uploadedFiles: uploadedFiles
        });
    } catch (error) {
        console.error("Upload subtask attachments error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ DELETE /api/projects/delete-team/:team_id
 * Delete team and all its projects, tasks, subtasks, and S3 folders
 */
router.delete("/delete-team/:team_id", express.json(), async (req, res) => {
    console.log('🔍 Delete team route hit:', req.params.team_id);
    console.log('🔍 Request body:', req.body);
    
    const { team_id } = req.params;
    const { admin_user_id } = req.body;

    try {
        // Validate admin user
        const [adminRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        if (adminRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid admin user ID" });
        }

        // Check if team exists and belongs to this admin
        const [teamRows] = await db.query(
            "SELECT * FROM teams WHERE team_id = ? AND team_created_by = ?",
            [team_id, admin_user_id]
        );
        if (teamRows.length === 0) {
            return res.status(404).json({ success: false, error: "Team not found or access denied" });
        }

        const team = teamRows[0];

        // Start transaction
        await db.query("START TRANSACTION");

        try {
            // 1. Get all projects for this team
            const [projects] = await db.query("SELECT * FROM projects WHERE team_id = ?", [team_id]);
            
            // 2. For each project, get all tasks
            for (const project of projects) {
                const [tasks] = await db.query("SELECT * FROM tasks WHERE task_project_id = ?", [project.proj_id]);
                
                // 3. For each task, delete subtasks first (children before parents)
                for (const task of tasks) {
                    // Delete subtask attachments first
                    await db.query("DELETE FROM subtask_attachments WHERE subtask_id IN (SELECT subtask_id FROM subtasks WHERE task_id = ?)", [task.task_id]);
                    
                    // Delete subtask assignments
                    await db.query("DELETE FROM subtask_assignment WHERE subtask_id IN (SELECT subtask_id FROM subtasks WHERE task_id = ?)", [task.task_id]);
                    
                    // Delete subtasks
                    await db.query("DELETE FROM subtasks WHERE task_id = ?", [task.task_id]);
                }
                
                // 4. Delete tasks
                await db.query("DELETE FROM tasks WHERE task_project_id = ?", [project.proj_id]);
            }
            
            // 5. Delete projects
            await db.query("DELETE FROM projects WHERE team_id = ?", [team_id]);
            
            // 6. Finally delete the team
            await db.query("DELETE FROM teams WHERE team_id = ?", [team_id]);

            // Commit transaction
            await db.query("COMMIT");

            // Try to delete S3 folder (but don't fail if S3 fails)
            try {
                const s3FolderPath = `${admin_user_id}/${team.team_name}/`;
                console.log('🔍 Attempting to delete S3 folder:', s3FolderPath);
                
                // List all objects in the folder
                const listParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Prefix: s3FolderPath
                };
                
                const listedObjects = await s3.listObjectsV2(listParams).promise();
                
                if (listedObjects.Contents.length > 0) {
                    const deleteParams = {
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Delete: {
                            Objects: listedObjects.Contents.map(({ Key }) => ({ Key }))
                        }
                    };
                    
                    await s3.deleteObjects(deleteParams).promise();
                    console.log('✅ S3 folder deleted successfully');
                }
            } catch (s3Error) {
                console.warn('⚠️ S3 deletion failed (continuing with DB deletion):', s3Error.message);
                // Don't fail the entire operation if S3 fails
            }

            res.json({ success: true, message: "Team and all associated data deleted successfully" });

        } catch (error) {
            // Rollback transaction on error
            await db.query("ROLLBACK");
            throw error;
        }

    } catch (error) {
        console.error("Team deletion error:", error);
        res.status(500).json({ success: false, error: "Failed to delete team: " + error.message });
    }
});

/**
 * ✅ DELETE /api/projects/delete-project/:project_id
 * Delete project and all its tasks, subtasks, and S3 folders
 */
router.delete("/delete-project/:project_id", express.json(), async (req, res) => {
    const { project_id } = req.params;
    const { admin_user_id } = req.body;

    try {
        // Validate admin user
        const [adminRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        if (adminRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid admin user ID" });
        }

        // Get project details
        const [projectRows] = await db.query(
            `SELECT p.*, t.team_name, t.team_created_by 
             FROM projects p 
             JOIN teams t ON p.team_id = t.team_id 
             WHERE p.proj_id = ? AND t.team_created_by = ?`,
            [project_id, admin_user_id]
        );
        if (projectRows.length === 0) {
            return res.status(404).json({ success: false, error: "Project not found or access denied" });
        }

        const project = projectRows[0];

        // Get all tasks for this project
        const [tasks] = await db.query("SELECT * FROM tasks WHERE task_project_id = ?", [project_id]);
        
        // Delete all subtask attachments and S3 files
        for (const task of tasks) {
            const [subtasks] = await db.query("SELECT * FROM subtasks WHERE task_id = ?", [task.task_id]);
            
            for (const subtask of subtasks) {
                // Delete subtask attachments from S3
                const [attachments] = await db.query(
                    "SELECT * FROM subtask_attachments WHERE subtask_id = ?",
                    [subtask.subtask_id]
                );
                
                for (const attachment of attachments) {
                    try {
                        // Delete from S3
                        const key = attachment.subatt_file_path.replace(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/`, '');
                        await s3.deleteObject({
                            Bucket: process.env.AWS_S3_BUCKET_NAME,
                            Key: key
                        }).promise();
                    } catch (s3Error) {
                        console.error("S3 delete error:", s3Error);
                    }
                }
                
                // Delete subtask attachments from database
                await db.query("DELETE FROM subtask_attachments WHERE subtask_id = ?", [subtask.subtask_id]);
                
                // Delete subtask assignments
                await db.query("DELETE FROM subtask_assignment WHERE subtask_id = ?", [subtask.subtask_id]);
            }
            
            // Delete subtasks
            await db.query("DELETE FROM subtasks WHERE task_id = ?", [task.task_id]);
        }
        
        // Delete tasks
        await db.query("DELETE FROM tasks WHERE task_project_id = ?", [project_id]);

        // Delete S3 folder structure for the project
        try {
            const s3FolderPath = `${project.team_created_by}/${project.team_name}/${project.proj_name}`;
            const { Contents } = await s3.listObjectsV2({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Prefix: s3FolderPath
            }).promise();
            
            if (Contents && Contents.length > 0) {
                const deleteParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Delete: {
                        Objects: Contents.map(obj => ({ Key: obj.Key }))
                    }
                };
                await s3.deleteObjects(deleteParams).promise();
            }
        } catch (s3Error) {
            console.error("S3 folder delete error:", s3Error);
        }

        // Delete project from database
        await db.query("DELETE FROM projects WHERE proj_id = ?", [project_id]);

        res.json({ success: true, message: "Project and all associated data deleted successfully" });
    } catch (error) {
        console.error("Project deletion error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ DELETE /api/projects/delete-task/:task_id
 * Delete task and all its subtasks and S3 folders
 */
router.delete("/delete-task/:task_id", express.json(), async (req, res) => {
    const { task_id } = req.params;
    const { admin_user_id } = req.body;

    try {
        // Validate admin user
        const [adminRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        if (adminRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid admin user ID" });
        }

        // Get task details
        const [taskRows] = await db.query(
            `SELECT t.*, p.proj_name, p.team_id, tm.team_name, tm.team_created_by 
             FROM tasks t 
             JOIN projects p ON t.task_project_id = p.proj_id 
             JOIN teams tm ON p.team_id = tm.team_id 
             WHERE t.task_id = ? AND tm.team_created_by = ?`,
            [task_id, admin_user_id]
        );
        if (taskRows.length === 0) {
            return res.status(404).json({ success: false, error: "Task not found or access denied" });
        }

        const task = taskRows[0];

        // Get all subtasks for this task
        const [subtasks] = await db.query("SELECT * FROM subtasks WHERE task_id = ?", [task_id]);
        
        // Delete all subtask attachments and S3 files
        for (const subtask of subtasks) {
            const [attachments] = await db.query(
                "SELECT * FROM subtask_attachments WHERE subtask_id = ?",
                [subtask.subtask_id]
            );
            
            for (const attachment of attachments) {
                try {
                    // Delete from S3
                    const key = attachment.subatt_file_path.replace(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/`, '');
                    await s3.deleteObject({
                        Bucket: process.env.AWS_S3_BUCKET_NAME,
                        Key: key
                    }).promise();
                } catch (s3Error) {
                    console.error("S3 delete error:", s3Error);
                }
            }
            
            // Delete subtask attachments from database
            await db.query("DELETE FROM subtask_attachments WHERE subtask_id = ?", [subtask.subtask_id]);
            
            // Delete subtask assignments
            await db.query("DELETE FROM subtask_assignment WHERE subtask_id = ?", [subtask.subtask_id]);
        }

        // Delete S3 folder structure for the task
        try {
            const s3FolderPath = `${task.team_created_by}/${task.team_name}/${task.proj_name}/${task.task_name}`;
            const { Contents } = await s3.listObjectsV2({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Prefix: s3FolderPath
            }).promise();
            
            if (Contents && Contents.length > 0) {
                const deleteParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Delete: {
                        Objects: Contents.map(obj => ({ Key: obj.Key }))
                    }
                };
                await s3.deleteObjects(deleteParams).promise();
            }
        } catch (s3Error) {
            console.error("S3 folder delete error:", s3Error);
        }

        // Delete subtasks
        await db.query("DELETE FROM subtasks WHERE task_id = ?", [task_id]);

        // Delete task from database
        await db.query("DELETE FROM tasks WHERE task_id = ?", [task_id]);

        res.json({ success: true, message: "Task and all associated data deleted successfully" });
    } catch (error) {
        console.error("Task deletion error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ DELETE /api/projects/delete-subtask/:subtask_id
 * Delete subtask and its S3 folder
 */
router.delete("/delete-subtask/:subtask_id", express.json(), async (req, res) => {
    const { subtask_id } = req.params;
    const { admin_user_id } = req.body;

    try {
        // Validate admin user
        const [adminRows] = await db.query("SELECT * FROM employees WHERE emp_user_id = ?", [admin_user_id]);
        if (adminRows.length === 0) {
            return res.status(400).json({ success: false, error: "Invalid admin user ID" });
        }

        // Get subtask details
        const [subtaskRows] = await db.query(
            `SELECT s.*, t.task_name, p.proj_name, tm.team_name, tm.team_created_by 
             FROM subtasks s 
             JOIN tasks t ON s.task_id = t.task_id 
             JOIN projects p ON t.task_project_id = p.proj_id 
             JOIN teams tm ON p.team_id = tm.team_id 
             WHERE s.subtask_id = ? AND tm.team_created_by = ?`,
            [subtask_id, admin_user_id]
        );
        if (subtaskRows.length === 0) {
            return res.status(404).json({ success: false, error: "Subtask not found or access denied" });
        }

        const subtask = subtaskRows[0];

        // Delete subtask attachments from S3
        const [attachments] = await db.query(
            "SELECT * FROM subtask_attachments WHERE subtask_id = ?",
            [subtask_id]
        );
        
        for (const attachment of attachments) {
            try {
                // Delete from S3
                const key = attachment.subatt_file_path.replace(`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/`, '');
                await s3.deleteObject({
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: key
                }).promise();
            } catch (s3Error) {
                console.error("S3 delete error:", s3Error);
            }
        }

        // Delete subtask attachments from database
        await db.query("DELETE FROM subtask_attachments WHERE subtask_id = ?", [subtask_id]);
        
        // Delete subtask assignments
        await db.query("DELETE FROM subtask_assignment WHERE subtask_id = ?", [subtask_id]);

        // Delete S3 folder structure for the subtask
        try {
            const s3FolderPath = `${subtask.team_created_by}/${subtask.team_name}/${subtask.proj_name}/${subtask.task_name}/${subtask.subtask_name}`;
            const { Contents } = await s3.listObjectsV2({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Prefix: s3FolderPath
            }).promise();
            
            if (Contents && Contents.length > 0) {
                const deleteParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Delete: {
                        Objects: Contents.map(obj => ({ Key: obj.Key }))
                    }
                };
                await s3.deleteObjects(deleteParams).promise();
            }
        } catch (s3Error) {
            console.error("S3 folder delete error:", s3Error);
        }

        // Delete subtask from database
        await db.query("DELETE FROM subtasks WHERE subtask_id = ?", [subtask_id]);

        res.json({ success: true, message: "Subtask and all associated data deleted successfully" });
    } catch (error) {
        console.error("Subtask deletion error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
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
             LEFT JOIN employees e ON t.task_employee_id = e.emp_id
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
 * ✅ GET /api/projects/employee/subtasks/:task_id/:employee_id
 * Get subtasks in a task assigned to employee
 */
router.get("/employee/subtasks/:task_id/:employee_id", async (req, res) => {
    const { task_id, employee_id } = req.params;
    
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
        
        // Get subtasks assigned to employee (both direct and through assignment table)
        // Use emp_id (numeric) for assignments since that's how they're stored in the database
        const [subtasks] = await db.query(
            `SELECT DISTINCT s.*, 
                    GROUP_CONCAT(CONCAT(e.emp_first_name, ' ', e.emp_last_name, ' (', e.emp_user_id, ')') SEPARATOR ', ') as assigned_employees
             FROM subtasks s 
             LEFT JOIN subtask_assignment sa ON s.subtask_id = sa.subtask_id
             LEFT JOIN employees e ON (sa.employee_id = e.emp_id OR s.employee_id = e.emp_id)
             WHERE s.task_id = ? AND (sa.employee_id = ? OR s.employee_id = ?)
             GROUP BY s.subtask_id
             ORDER BY s.subtask_created_at DESC`,
            [task_id, employee.emp_id, employee.emp_id]
        );
        
        res.json(subtasks);
    } catch (error) {
        console.error("Employee subtasks error:", error);
        res.status(500).json({ error: "Failed to fetch employee subtasks" });
    }
});

/**
 * ✅ POST /api/projects/employee/upload-attachment/:subtask_id
 * Employee uploads attachment to subtask
 */
router.post("/employee/upload-attachment/:subtask_id", upload.array('attachments'), async (req, res) => {
    const { subtask_id } = req.params;
    const { employee_id, feedback } = req.body;
    const files = req.files || [];
    
    try {
        // Validate employee and subtask assignment
        const [empRows] = await db.query(
            "SELECT emp_id, emp_user_id FROM employees WHERE emp_user_id = ?",
            [employee_id]
        );
        
        if (empRows.length === 0) {
            return res.status(404).json({ success: false, error: "Employee not found" });
        }
        
        const employee = empRows[0];
        
        // Check if employee is assigned to this subtask
        const [assignmentRows] = await db.query(
            "SELECT * FROM subtask_assignment WHERE subtask_id = ? AND employee_id = ?",
            [subtask_id, employee.emp_id]
        );
        
        if (assignmentRows.length === 0) {
            return res.status(403).json({ success: false, error: "Not assigned to this subtask" });
        }
        
        // Get subtask and project details for S3 path
        const [subtaskRows] = await db.query(
            `SELECT s.*, t.task_name, p.proj_name, tm.team_name, tm.team_created_by 
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
        
        // Create S3 folder for employee uploads
        const s3FolderPath = `${subtask.team_created_by}/${subtask.team_name}/${subtask.proj_name}/${subtask.task_name}/${subtask.subtask_name}/employee_uploads`;
        await createS3Folder(s3FolderPath);
        
        // Upload files to S3 and store metadata
        const uploadedFiles = [];
        for (const file of files) {
            try {
                const s3Url = await uploadFileToS3(s3FolderPath, file);
                
                // Store file metadata in database
                await db.query(
                    `INSERT INTO subtask_attachment 
                    (subatt_subtask_id, subatt_file_name, subatt_file_type, subatt_file_path, subatt_uploaded_by, subatt_created_at, subatt_updated_at) 
                    VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                    [subtask_id, file.originalname, file.mimetype, s3Url, employee.emp_user_id]
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
        
        // Update subtask status to completed (100%) and add feedback
        await db.query(
            `UPDATE subtasks 
             SET subtask_status = 2, 
                 subtask_progress = 100,
                 subtask_completion_feedback = ?,
                 subtask_completed_at = NOW(),
                 subtask_updated_at = NOW()
             WHERE subtask_id = ?`,
            [feedback, subtask_id]
        );
        
        // Update task progress based on completed subtasks
        await updateTaskProgress(subtask.task_id);
        
        res.json({ 
            success: true, 
            message: "Attachment uploaded and task marked as complete",
            uploadedFiles: uploadedFiles
        });
    } catch (error) {
        console.error("Employee upload error:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
});

/**
 * ✅ GET /api/projects/employee/notifications/:employee_id
 * Get notifications for employee (new tasks, etc.)
 */
router.get("/employee/notifications/:employee_id", async (req, res) => {
    const { employee_id } = req.params;
    
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
        
        // Get recent subtask assignments (last 7 days)
        const [notifications] = await db.query(
            `SELECT sa.*, s.subtask_name, s.subtask_description, t.task_name, p.proj_name, tm.team_name
             FROM subtask_assignment sa
             JOIN subtasks s ON sa.subtask_id = s.subtask_id
             JOIN tasks t ON s.task_id = t.task_id
             JOIN projects p ON t.task_project_id = p.proj_id
             JOIN teams tm ON p.team_id = tm.team_id
             WHERE sa.employee_id = ? AND sa.subass_assigned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             ORDER BY sa.subass_assigned_at DESC`,
            [employee.emp_id]
        );
        
        res.json(notifications);
    } catch (error) {
        console.error("Employee notifications error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
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

module.exports = router;