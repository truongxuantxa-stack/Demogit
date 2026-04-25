const pool = require('./config/db');

async function fix() {
    try {
        // Kiểm tra cột full_name đã tồn tại chưa
        const dbName = process.env.DB_NAME || 'student_request_system';
        const [cols] = await pool.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'full_name'`,
            [dbName]
        );
        if (cols.length === 0) {
            await pool.query('ALTER TABLE users ADD COLUMN full_name VARCHAR(100) DEFAULT NULL');
            console.log('Da them cot full_name vao bang users');
        } else {
            console.log('Cot full_name da ton tai, bo qua.');
        }

        // Cập nhật tên cho admin
        await pool.query("UPDATE users SET full_name = 'Quan tri vien' WHERE username = 'admin' AND full_name IS NULL");
        console.log('Da cap nhat full_name cho admin');

        console.log('Hoan tat!');
        process.exit(0);
    } catch (e) {
        console.error('Loi:', e.message);
        process.exit(1);
    }
}

fix();
