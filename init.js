const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    try {
        console.log('Connecting to MySQL server...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
        });

        console.log(`Creating database ${process.env.DB_NAME} if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        
        console.log('Switching to database...');
        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        console.log('Creating users table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'admin') DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Creating requests table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                receiver VARCHAR(255) NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                pdf_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Insert a default admin account
        const bcrypt = require('bcryptjs');
        const adminPass = await bcrypt.hash('admin123', 10);
        await connection.query(`
            INSERT IGNORE INTO users (username, password, role) 
            VALUES ('admin', ?, 'admin');
        `, [adminPass]);

        console.log('Database initialized successfully.');
        console.log('Default Admin Account -> Username: admin, Password: admin123');
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
}

initDB();
