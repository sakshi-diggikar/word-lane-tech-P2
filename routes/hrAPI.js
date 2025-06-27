// routes/hrAPI.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// ✅ Add new employee (CREATE)
router.post('/add-employee', async (req, res) => {
    const {
        user_id,
        first_name,
        last_name,
        e_mail,
        phone,
        gender,
        dob,
        joining_date,
        address,
        password,
        emp_role_id,
    } = req.body;

    try {
        const password_hash = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO employees 
            (emp_user_id, emp_first_name, emp_last_name, emp_email, emp_phone, emp_gender, emp_dob, emp_joining_date, emp_address, emp_password_hash, emp_role_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                first_name,
                last_name,
                e_mail,
                phone,
                gender,
                dob,
                joining_date,
                address,
                password_hash,
                emp_role_id,
            ]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Insert failed:", err);
        res.status(500).json({ success: false, message: 'Insert failed' });
    }
});

// ✅ Update employee (UPDATE)
router.put('/update-employee/:id', async (req, res) => {
    const id = req.params.id;
    const {
        first_name,
        last_name,
        e_mail,
        phone,
        gender,
        dob,
        joining_date,
        address,
        password,
        emp_role_id,
    } = req.body;

    try {
        const password_hash = await bcrypt.hash(password, 10);

        await pool.query(
            `UPDATE employees SET
            emp_first_name = ?, emp_last_name = ?, emp_email = ?, emp_phone = ?, emp_gender = ?, 
            emp_dob = ?, emp_joining_date = ?, emp_address = ?, emp_password_hash = ?, emp_role_id = ?
            WHERE emp_user_id = ?`,
            [
                first_name,
                last_name,
                e_mail,
                phone,
                gender,
                dob,
                joining_date,
                address,
                password_hash,
                emp_role_id,
                id,
            ]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("Update failed:", err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// ✅ List all employees (GET)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT emp_user_id, emp_first_name AS emp_fname, emp_last_name AS emp_lname FROM employees'
        );
        res.json(rows); // ✅ Your frontend expects these exact fields
    } catch (err) {
        console.error("Fetch employees failed:", err);
        res.status(500).json({ success: false, message: 'Fetch failed' });
    }
});

module.exports = router;
