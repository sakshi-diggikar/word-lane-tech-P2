// Backend: routes/auth.js
router.post('/login', async (req, res) => {
    const { emp_user_id, emp_password } = req.body;

    const [rows] = await db.query(
        'SELECT * FROM employees WHERE emp_user_id = ?',
        [emp_user_id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    const isPasswordMatch = await bcrypt.compare(emp_password, user.emp_password_hash);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    // success: return role, redirect, etc
});
  