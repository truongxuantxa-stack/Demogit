const pool = require('../config/db');

class UserRepository {
    async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    async create(username, passwordHash, role = 'student', full_name = null) {
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)',
            [username, passwordHash, role, full_name]
        );
        return result.insertId;
    }
}

module.exports = new UserRepository();
