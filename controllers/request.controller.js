const requestService = require('../services/request.service');
const path = require('path');

class RequestController {
    // API and View Render Logic for Student
    async createRequest(req, res) {
        try {
            const { type, content, receiver } = req.body;
            const userId = req.user.id; // from auth middleware

            if (!type || !content || !receiver) {
                if (req.accepts('html')) {
                    return res.render('create-request', { user: req.user, error: 'Vui lòng điền đủ thông tin' });
                }
                return res.status(400).json({ message: 'All fields are required' });
            }

            await requestService.createRequest(userId, type, content, receiver);
            
            if (req.accepts('html')) {
                return res.redirect('/dashboard');
            }
            res.status(201).json({ message: 'Request created successfully' });
        } catch (error) {
            if (req.accepts('html')) {
                return res.render('create-request', { user: req.user, error: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async getStudentRequests(req, res) {
        try {
            const userId = req.user.id;
            const requests = await requestService.getStudentRequests(userId);
            
            if (req.accepts('html')) {
                return res.render('list-requests', { user: req.user, requests });
            }
            res.status(200).json(requests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getRequestById(req, res) {
        try {
            const { id } = req.params;
            const request = await requestService.getRequestById(id);
            
            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }

            // check ownership if not admin
            if (req.user.role !== 'admin' && request.user_id !== req.user.id) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            res.status(200).json(request);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Admin
    async getAllRequests(req, res) {
        try {
            const requests = await requestService.getAllRequests();
            
            if (req.accepts('html')) {
                return res.render('admin-dashboard', { user: req.user, requests });
            }
            res.status(200).json(requests);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async approveRequest(req, res) {
        try {
            const { id } = req.params;
            const pdfUrl = await requestService.approveRequest(id);

            res.status(200).json({ message: 'Request approved', pdfUrl });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async rejectRequest(req, res) {
        try {
            const { id } = req.params;
            await requestService.rejectRequest(id);
            
            res.status(200).json({ message: 'Request rejected' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new RequestController();
