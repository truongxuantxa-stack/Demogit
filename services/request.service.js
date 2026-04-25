const requestRepository = require('../repositories/request.repo');
const PdfUtil = require('../utils/pdf.util');

class RequestService {
    async createRequest(userId, type, content, receiver) {
        return await requestRepository.create(userId, type, content, receiver);
    }

    async getStudentRequests(userId) {
        return await requestRepository.findByUserId(userId);
    }

    async getRequestById(id) {
        return await requestRepository.findById(id);
    }

    async getAllRequests() {
        return await requestRepository.findAll();
    }

    async approveRequest(id) {
        const request = await requestRepository.findById(id);
        if (!request) {
            throw new Error('Request not found');
        }
        if (request.status !== 'pending') {
            throw new Error('Request already processed');
        }

        // Generate PDF
        const pdfUrl = await PdfUtil.generateRecommendationLetter(request);
        
        // Update database
        await requestRepository.updateStatus(id, 'approved', pdfUrl);
        return pdfUrl;
    }

    async rejectRequest(id) {
        const request = await requestRepository.findById(id);
        if (!request) {
            throw new Error('Request not found');
        }
        if (request.status !== 'pending') {
            throw new Error('Request already processed');
        }

        await requestRepository.updateStatus(id, 'rejected');
    }
}

module.exports = new RequestService();
