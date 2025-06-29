const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create leaves table if not exists
async function createLeavesTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leaves (
                leave_id INT AUTO_INCREMENT PRIMARY KEY,
                employee_id INT NOT NULL,
                leave_start_date DATE NOT NULL,
                leave_end_date DATE NOT NULL,
                leave_reason TEXT NOT NULL,
                leave_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
                leave_approved_by INT,
                leave_approved_at DATETIME,
                leave_approval_remark TEXT,
                leave_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                leave_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (employee_id) REFERENCES employees(emp_id) ON DELETE CASCADE,
                FOREIGN KEY (leave_approved_by) REFERENCES employees(emp_id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Leaves table created/verified');
    } catch (error) {
        console.error('❌ Error creating leaves table:', error);
    }
}

// Initialize table
createLeavesTable();

// Create a new leave application
router.post('/apply', async (req, res) => {
    try {
        const {
            employee_id,
            leave_start_date,
            leave_end_date,
            leave_reason
        } = req.body;

        // Validate required fields
        if (!employee_id || !leave_start_date || !leave_end_date || !leave_reason) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate dates
        const startDate = new Date(leave_start_date);
        const endDate = new Date(leave_end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be in the past'
            });
        }

        if (endDate < startDate) {
            return res.status(400).json({
                success: false,
                message: 'End date cannot be before start date'
            });
        }

        // Check if employee exists
        const [employeeCheck] = await pool.query(
            'SELECT emp_id FROM employees WHERE emp_id = ?',
            [employee_id]
        );

        if (employeeCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check for overlapping leave requests
        const [overlappingLeaves] = await pool.query(
            `SELECT leave_id FROM leaves 
             WHERE employee_id = ? 
             AND leave_status != 'Rejected'
             AND (
                 (leave_start_date <= ? AND leave_end_date >= ?) OR
                 (leave_start_date <= ? AND leave_end_date >= ?) OR
                 (leave_start_date >= ? AND leave_end_date <= ?)
             )`,
            [employee_id, leave_start_date, leave_start_date, leave_end_date, leave_end_date, leave_start_date, leave_end_date]
        );

        if (overlappingLeaves.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have a leave request for these dates'
            });
        }

        // Insert the leave application
        const [result] = await pool.query(
            `INSERT INTO leaves (employee_id, leave_start_date, leave_end_date, leave_reason) 
             VALUES (?, ?, ?, ?)`,
            [employee_id, leave_start_date, leave_end_date, leave_reason]
        );

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            leave_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating leave application:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get leave applications for an employee
router.get('/employee/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;

        const [leaves] = await pool.query(
            `SELECT l.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as employee_name,
                    CONCAT(a.emp_first_name, ' ', a.emp_last_name) as approved_by_name
             FROM leaves l
             LEFT JOIN employees e ON l.employee_id = e.emp_id
             LEFT JOIN employees a ON l.leave_approved_by = a.emp_id
             WHERE l.employee_id = ?
             ORDER BY l.leave_created_at DESC`,
            [employeeId]
        );

        res.json({
            success: true,
            leaves: leaves
        });

    } catch (error) {
        console.error('Error fetching leave applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get all leave applications (for HR/Admin)
router.get('/all', async (req, res) => {
    try {
        const [leaves] = await pool.query(
            `SELECT l.*, 
                    CONCAT(e.emp_first_name, ' ', e.emp_last_name) as employee_name,
                    CONCAT(a.emp_first_name, ' ', a.emp_last_name) as approved_by_name
             FROM leaves l
             LEFT JOIN employees e ON l.employee_id = e.emp_id
             LEFT JOIN employees a ON l.leave_approved_by = a.emp_id
             ORDER BY l.leave_created_at DESC`
        );

        res.json({
            success: true,
            leaves: leaves
        });

    } catch (error) {
        console.error('Error fetching all leave applications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update leave status (approve/reject)
router.put('/:leaveId/status', async (req, res) => {
    try {
        const { leaveId } = req.params;
        const { status, approved_by, approval_remark } = req.body;

        // Validate status
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be Pending, Approved, or Rejected'
            });
        }

        // Check if leave exists
        const [leaveCheck] = await pool.query(
            'SELECT leave_id FROM leaves WHERE leave_id = ?',
            [leaveId]
        );

        if (leaveCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        // Update the leave status
        const updateData = {
            leave_status: status,
            leave_updated_at: new Date()
        };

        if (status === 'Approved' || status === 'Rejected') {
            updateData.leave_approved_by = approved_by;
            updateData.leave_approved_at = new Date();
            updateData.leave_approval_remark = approval_remark || null;
        }

        await pool.query(
            `UPDATE leaves 
             SET leave_status = ?, 
                 leave_approved_by = ?, 
                 leave_approved_at = ?, 
                 leave_approval_remark = ?,
                 leave_updated_at = ?
             WHERE leave_id = ?`,
            [
                updateData.leave_status,
                updateData.leave_approved_by,
                updateData.leave_approved_at,
                updateData.leave_approval_remark,
                updateData.leave_updated_at,
                leaveId
            ]
        );

        res.json({
            success: true,
            message: `Leave application ${status.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get leave statistics for an employee
router.get('/stats/:employeeId', async (req, res) => {
    try {
        const { employeeId } = req.params;

        const [stats] = await pool.query(
            `SELECT 
                COUNT(*) as total_leaves,
                SUM(CASE WHEN leave_status = 'Pending' THEN 1 ELSE 0 END) as pending_leaves,
                SUM(CASE WHEN leave_status = 'Approved' THEN 1 ELSE 0 END) as approved_leaves,
                SUM(CASE WHEN leave_status = 'Rejected' THEN 1 ELSE 0 END) as rejected_leaves
             FROM leaves 
             WHERE employee_id = ?`,
            [employeeId]
        );

        res.json({
            success: true,
            stats: stats[0]
        });

    } catch (error) {
        console.error('Error fetching leave statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get employee data by user ID
router.get('/employee-data/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [employee] = await pool.query(
            `SELECT emp_id, emp_user_id, emp_first_name, emp_last_name, emp_email 
             FROM employees 
             WHERE emp_user_id = ?`,
            [userId]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        res.json({
            success: true,
            employee: employee[0]
        });

    } catch (error) {
        console.error('Error fetching employee data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get HR employee data (for receiver name)
router.get('/hr-data', async (req, res) => {
    try {
        const [hrEmployee] = await pool.query(
            `SELECT emp_id, emp_user_id, emp_first_name, emp_last_name 
             FROM employees 
             WHERE emp_user_id = 'hr001' 
             LIMIT 1`
        );

        if (hrEmployee.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'HR employee not found'
            });
        }

        res.json({
            success: true,
            hrEmployee: hrEmployee[0]
        });

    } catch (error) {
        console.error('Error fetching HR data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router; 