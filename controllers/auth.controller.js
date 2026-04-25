const authService = require('../services/auth.service');

class AuthController {
    // API and View Render Logic
    
    async register(req, res) {
        try {
            const { username, password, full_name } = req.body;
            if (!username || !password || !full_name) {
                if (req.accepts('html')) {
                    return res.render('register', { error: 'Vui lòng nhập đủ thông tin' });
                }
                return res.status(400).json({ message: 'Username, password and full_name are required' });
            }

            await authService.register(username, password, full_name);
            
            if (req.accepts('html')) {
                return res.redirect('/login?success=Đăng ký thành công, vui lòng đăng nhập');
            }
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            if (req.accepts('html')) {
                return res.render('register', { error: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                if (req.accepts('html')) {
                    return res.render('login', { error: 'Vui lòng nhập đủ thông tin', success: null });
                }
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const { user, token } = await authService.login(username, password);
            
            // Set cookie
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day

            if (req.accepts('html')) {
                if (user.role === 'admin') {
                    return res.redirect('/admin/dashboard');
                } else {
                    return res.redirect('/dashboard');
                }
            }
            res.status(200).json({ token, role: user.role });
        } catch (error) {
            if (req.accepts('html')) {
                return res.render('login', { error: error.message, success: null });
            }
            res.status(401).json({ message: error.message });
        }
    }

    logout(req, res) {
        res.clearCookie('token');
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        res.status(200).json({ message: 'Logged out successfully' });
    }
}

module.exports = new AuthController();
