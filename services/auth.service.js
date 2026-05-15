const userRepository = require('../repositories/user.repo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
    async register(username, password, full_name) {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await userRepository.create(username, hashedPassword, 'student', full_name);
        return userId;
    }

    async login(username, password) {
        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return { user, token };
    }
}

module.exports = new AuthService();
