const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'sakshi',
    database: 'management'
});

// Test database connection
async function testConnection() {
    try {
        const [rows] = await db.query('SELECT 1 + 1 AS solution');
        console.log(' Database connected successfully');
    } catch (err) {
        console.error(' Database connection failed:', err);
    }
}
testConnection();

// Login route
app.post('/api/login', async (req, res) => {
    try {
        const { user_id, e_mail, password } = req.body;

        if (!user_id || !e_mail || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check if user ID exists
        const [userExists] = await db.query(`
            SELECT user_id FROM employee_tb WHERE user_id = ?
            UNION
            SELECT user_id FROM admin_tb WHERE user_id = ?
            UNION
            SELECT user_id FROM hr_tb WHERE user_id = ?
        `, [user_id, user_id, user_id]);

        if (userExists.length === 0) {
            return res.json({ success: false, message: 'User ID not found' });
        }

        // Check if email exists for that user
        const [emailExists] = await db.query(`
            SELECT e_mail FROM employee_tb WHERE user_id = ? AND e_mail = ?
            UNION
            SELECT e_mail FROM admin_tb WHERE user_id = ? AND e_mail = ?
            UNION
            SELECT e_mail FROM hr_tb WHERE user_id = ? AND e_mail = ?
        `, [user_id, e_mail, user_id, e_mail, user_id, e_mail]);

        if (emailExists.length === 0) {
            return res.json({ success: false, message: 'Email ID not found for this user ID' });
        }

        // Final credentials check with password
        const [results] = await db.query(`
            SELECT 'employee' AS role, CONCAT(first_name, ' ', last_name) AS name 
            FROM employee_tb 
            WHERE user_id = ? AND e_mail = ? AND password_hash = ?
            UNION ALL
            SELECT 'admin' AS role, CONCAT(first_name, ' ', last_name) AS name 
            FROM admin_tb 
            WHERE user_id = ? AND e_mail = ? AND password_hash = ?
            UNION ALL
            SELECT 'hr' AS role, CONCAT(first_name, ' ', last_name) AS name 
            FROM hr_tb 
            WHERE user_id = ? AND e_mail = ? AND password_hash = ?
            LIMIT 1
        `, [
            user_id, e_mail, password,
            user_id, e_mail, password,
            user_id, e_mail, password
        ]);

        if (results.length === 0) {
            return res.json({ success: false, message: 'Incorrect password' });
        }

        // Success
        res.json({
            success: true,
            role: results[0].role,
            name: results[0].name,
            user_id: user_id
        });


    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
app.get('/api/admin/summary', async (req, res) => {
    try {
        const [totalTasks] = await db.query('SELECT COUNT(*) AS count FROM task_tb');
        const [completedTasks] = await db.query("SELECT COUNT(*) AS count FROM task_tb WHERE status = 3");
        const [totalProjects] = await db.query('SELECT COUNT(*) AS count FROM project_tb');

        res.json({
            totalTasks: totalTasks[0].count,
            completedTasks: completedTasks[0].count,
            totalProjects: totalProjects[0].count
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
app.post('/api/admin/project', async (req, res) => {
    const { project_name, project_description, client_name, start_date, deadline_date, admin_id } = req.body;

    try {
        await db.query(
            `INSERT INTO project_tb (project_name, project_description, client_name, start_date, deadline_date, admin_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [project_name, project_description, client_name, start_date, deadline_date, admin_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Create project error:', err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.get('/api/admin/assigned-tasks', async (req, res) => {
    try {
        const [rows] = await db.query(`
        SELECT 
          p.id AS project_id,
          p.project_name,
          t.task_name,
          t.updated_at AS due_on,
          CASE 
            WHEN t.status = 1 THEN 'Active'
            WHEN t.status = 2 THEN 'Delayed'
            WHEN t.status = 3 THEN 'Completed'
            ELSE 'Unknown'
          END AS status,
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name
        FROM task_tb t
        JOIN project_tb p ON t.project_id = p.id
        JOIN employee_tb e ON t.employee_id = e.id
        ORDER BY t.updated_at DESC
      `);

        res.json(rows);
    } catch (err) {
        console.error('Assigned task fetch error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/projects', async (req, res) => {
    const adminId = req.query.admin_id;
    if (!adminId) return res.status(400).json({ error: 'Admin ID is required' });

    try {
        const [projects] = await db.query(`SELECT * FROM project_tb WHERE admin_id = ?`, [adminId]);
        const [tasks] = await db.query(`SELECT * FROM task_tb`);
        const [subtasks] = await db.query(`SELECT * FROM subtask_tb`);

        const projectMap = {};
        projects.forEach(p => {
            projectMap[p.id] = { ...p, tasks: [] };
        });

        const taskMap = {};
        tasks.forEach(t => {
            const task = { ...t, subtasks: [] };
            taskMap[t.id] = task;
            if (projectMap[t.project_id]) {
                projectMap[t.project_id].tasks.push(task);
            }
        });

        subtasks.forEach(s => {
            if (taskMap[s.task_id]) {
                taskMap[s.task_id].subtasks.push(s);
            }
        });

        const finalProjects = Object.values(projectMap);
        res.json(finalProjects);
    } catch (err) {
        console.error('Fetch project data error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/employee/analytics', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'User ID is required' });

    try {
        const [profile] = await db.query(
            `SELECT user_id, first_name, last_name, dob, department, designation, e_mail 
             FROM employee_tb WHERE user_id = ?`, [user_id]
        );

        const [attendance] = await db.query(
            `SELECT date, status FROM attendance_tb WHERE user_id = ? ORDER BY date DESC LIMIT 30`, [user_id]
        );

        const [tasks] = await db.query(
            `SELECT task_name, status, updated_at AS dueDate FROM task_tb WHERE employee_id = (
                SELECT id FROM employee_tb WHERE user_id = ?
            )`, [user_id]
        );

        res.json({ profile: profile[0], attendance, tasks });
    } catch (err) {
        console.error('Error fetching employee analytics:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/admin/task', async (req, res) => {
    const { task_name, task_description, project_id, deadline, employee_id } = req.body;
    try {
        await db.query(`INSERT INTO task_tb (task_name, project_id, employee_id, description, updated_at, status) VALUES (?, ?, ?, ?, ?, 1)`, [task_name, project_id, employee_id, task_description, deadline]);
        res.json({ success: true });
    } catch (err) {
        console.error('Create task error:', err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.post('/api/admin/subtask', async (req, res) => {
    const { subtask_name, subtask_description, task_id, employee_id, deadline } = req.body;
    try {
        await db.query(`INSERT INTO subtask_tb (subtask_name, task_id, employee_id, description, deadline) VALUES (?, ?, ?, ?, ?)`, [subtask_name, task_id, employee_id, subtask_description, deadline]);
        res.json({ success: true });
    } catch (err) {
        console.error('Create subtask error:', err);
        res.status(500).json({ error: 'Failed to create subtask' });
    }
});
app.get('/api/hr/todays-leaves', async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        const [rows] = await db.query(`
        SELECT
          l.id,
          CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
          l.start_date,
          l.end_date,
          l.reason,
          l.status
        FROM leave_tb l
        JOIN employee_tb e ON l.employee_id = e.id
        WHERE DATE(l.created_at) = ?
      `, [today]);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching today's leaves:", err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE employee by user_id
app.put('/api/hr/update-employee/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { first_name, last_name, e_mail, phone, gender, dob, joining_date, address } = req.body;

    try {
        const [result] = await db.query(`
            UPDATE employee_tb
            SET first_name = ?, last_name = ?, e_mail = ?, phone = ?, gender = ?, dob = ?, joining_date = ?, address = ?
            WHERE user_id = ?
        `, [first_name, last_name, e_mail, phone, gender, dob, joining_date, address, user_id]);

        res.json({ success: true });
    } catch (err) {
        console.error('Update employee error:', err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
});

// DELETE employee by user_id
app.delete('/api/hr/delete-employee/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
        await db.query(`DELETE FROM employee_tb WHERE user_id = ?`, [user_id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Delete employee error:', err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
});


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err.message);
});
