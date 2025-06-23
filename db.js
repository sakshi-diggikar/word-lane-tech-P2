// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'sakshi',
    database: 'management'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to DB:', err);
        return;
    }
    console.log('MySQL Connected...');
});

module.exports = db;
