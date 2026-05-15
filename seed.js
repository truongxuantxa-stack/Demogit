const pool = require('./config/db');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        console.log('Bắt đầu seed dữ liệu...');
        
        const saltRounds = 10;
        const users = [
            {
                username: "0241967",
                password: await bcrypt.hash("Khanh@12092004", saltRounds),
                full_name: "Nguyễn Văn Khánh",
                role: "student"
            },
            {
                username: "0241968",
                password: await bcrypt.hash("Hoa@15032004", saltRounds),
                full_name: "Lê Thị Hoa",
                role: "student"
            },
            {
                username: "0241969",
                password: await bcrypt.hash("Nam@123456", saltRounds),
                full_name: "Trần Văn Nam",
                role: "student"
            },
            {
                username: "0241970",
                password: await bcrypt.hash("Lan@123456", saltRounds),
                full_name: "Phạm Thị Lan",
                role: "student"
            },
            {
                username: "0241971",
                password: await bcrypt.hash("Tuan@123456", saltRounds),
                full_name: "Hoàng Minh Tuấn",
                role: "student"
            },
            {
                username: "0241972",
                password: await bcrypt.hash("Huy@123456", saltRounds),
                full_name: "Ngô Quang Huy",
                role: "student"
            },
            {
                username: "0241973",
                password: await bcrypt.hash("Ngoc@123456", saltRounds),
                full_name: "Đinh Bích Ngọc",
                role: "student"
            },
            {
                username: "CB_MOTCUA",
                password: await bcrypt.hash("123456", saltRounds),
                full_name: "Cán bộ Một Cửa",
                role: "admin"
            }
        ];

        for (const user of users) {
            await pool.execute(
                'INSERT IGNORE INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
                [user.username, user.password, user.full_name, user.role]
            );
            console.log(`Đã seed tài khoản: ${user.username}`);
        }

        console.log('Seed dữ liệu thành công!');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi khi seed dữ liệu:', error);
        process.exit(1);
    }
}

seed();
