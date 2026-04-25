const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const requestController = require('../controllers/request.controller');
const { authenticate, authorize, redirectIfAuthenticated } = require('../middlewares/auth.middleware');

// --- Views & Frontend Routes ---
router.get('/', redirectIfAuthenticated, (req, res) => res.redirect('/login'));

router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login', { error: null, success: req.query.success });
});

router.get('/register', redirectIfAuthenticated, (req, res) => {
    res.render('register', { error: null });
});

router.get('/dashboard', authenticate, authorize(['student']), requestController.getStudentRequests);

router.get('/create-request', authenticate, authorize(['student']), (req, res) => {
    res.render('create-request', { user: req.user, error: null });
});

router.get('/admin/dashboard', authenticate, authorize(['admin']), requestController.getAllRequests);


// --- API Routes ---
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Student APIs
router.post('/requests', authenticate, authorize(['student']), requestController.createRequest);

// Admin APIs
router.put('/admin/requests/:id/approve', authenticate, authorize(['admin']), requestController.approveRequest);
router.put('/admin/requests/:id/reject', authenticate, authorize(['admin']), requestController.rejectRequest);

module.exports = router;
