const userRepository = require('../repositories/user.repo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { performance } = require('perf_hooks');

class AuthService {
    async login(username, password) {
        const t0 = performance.now();

        const user = await userRepository.findByUsername(username);
        const t1 = performance.now();

        if (!user) {
            console.log(`[LOGIN] user=${username} | db=${(t1 - t0).toFixed(1)}ms | result=user_not_found`);
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        const t2 = performance.now();

        if (!isMatch) {
            console.log(`[LOGIN] user=${username} | db=${(t1 - t0).toFixed(1)}ms | bcrypt=${(t2 - t1).toFixed(1)}ms | result=wrong_password`);
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, full_name: user.full_name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        const t3 = performance.now();

        console.log(`[LOGIN] user=${username} | db=${(t1 - t0).toFixed(1)}ms | bcrypt=${(t2 - t1).toFixed(1)}ms | jwt=${(t3 - t2).toFixed(1)}ms | total=${(t3 - t0).toFixed(1)}ms`);
        return { user, token };
    }
}

module.exports = new AuthService();
