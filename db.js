const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Create notifications table if not exists
async function createNotificationsTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            type VARCHAR(50) NOT NULL,
            message TEXT NOT NULL,
            link VARCHAR(255),
            is_read BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// Call this during initialization
(async () => {
    await createNotificationsTable();
})();

module.exports = pool;
