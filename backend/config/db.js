const mysql = require('mysql2/promise');
require('dotenv').config();

// สร้างช่องทางการเชื่อมต่อไปยัง MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// ทดสอบการเชื่อมต่อ
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database successfully!');
        connection.release(); // คืนการเชื่อมต่อกลับสู่ระบบ
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err.message);
    });

module.exports = pool;