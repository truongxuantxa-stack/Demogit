const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    // Check token from cookies or authorization header
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        // If it's an API request, return 401. If it's a browser request (has accept: text/html), redirect to login
        if (req.accepts('html')) {
            return res.redirect('/login');
        }
        return res.status(401).json({ message: 'Unauthorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, username, role }
        next();
    } catch (err) {
        if (req.accepts('html')) {
            res.clearCookie('token');
            return res.redirect('/login');
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            if (req.accepts('html')) {
                return res.status(403).send('Forbidden: You do not have permission');
            }
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

const redirectIfAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role === 'admin') {
                return res.redirect('/admin/dashboard');
            }
            return res.redirect('/dashboard');
        } catch (err) {
            // Invalid token, proceed to login/register
            res.clearCookie('token');
            next();
        }
    } else {
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    redirectIfAuthenticated
};
