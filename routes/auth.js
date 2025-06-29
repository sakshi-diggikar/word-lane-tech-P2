const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

router.post("/login", async (req, res) => {
    const { emp_user_id, emp_password } = req.body;

    if (!emp_user_id || !emp_password)
        return res.status(400).json({ success: false, message: "Missing credentials" });

    try {
        const [rows] = await pool.query("SELECT * FROM employees WHERE emp_user_id = ?", [emp_user_id]);
        if (rows.length === 0)
            return res.status(401).json({ success: false, message: "User not found" });

        const user = rows[0];

        const isValid = await bcrypt.compare(emp_password, user.emp_password_hash);

        if (!isValid)
            return res.status(401).json({ success: false, message: "Invalid password" });

        let redirectTo = "login.html";
        if (user.emp_role_id === 1) redirectTo = "Admin/admin_panel.html";
        else if (user.emp_role_id === 2) redirectTo = "HR/hr_panel.html";
        else if (user.emp_role_id === 3) redirectTo = "Employee/employee_panel.html";
        else if (user.emp_role_id === 4) redirectTo = "Manager/manager_panel.html";

        res.json({
            success: true,
            name: `${user.emp_first_name} ${user.emp_last_name}`,
            emp_user_id: user.emp_user_id,
            redirect: redirectTo,
        });

    } catch (err) {
        console.error("Login error:", err.stack || err.message || err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
