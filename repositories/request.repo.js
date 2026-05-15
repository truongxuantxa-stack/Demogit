const pool = require('../config/db');

class RequestRepository {
    async create(userId, type, content, receiver) {
        const [result] = await pool.query(
            'INSERT INTO requests (user_id, type, content, receiver) VALUES (?, ?, ?, ?)',
            [userId, type, content, receiver]
        );
        return result.insertId;
    }

    async findByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM requests WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    }

    async findById(id) {
        const [rows] = await pool.query(
            `SELECT r.*, u.full_name as student_name, u.username as student_id 
             FROM requests r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.id = ?`,
            [id]
        );
        return rows[0];
    }

    async findAll() {
        const [rows] = await pool.query(
            `SELECT r.*, u.full_name as student_name, u.username as student_id 
             FROM requests r 
             JOIN users u ON r.user_id = u.id 
             ORDER BY r.created_at DESC`
        );
        return rows;
    }

    async updateStatus(id, status, pdfUrl = null) {
        if (pdfUrl) {
            await pool.query('UPDATE requests SET status = ?, pdf_url = ? WHERE id = ?', [status, pdfUrl, id]);
        } else {
            await pool.query('UPDATE requests SET status = ? WHERE id = ?', [status, id]);
        }
    }
}

module.exports = new RequestRepository();
