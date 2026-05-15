'use strict';

// ─── MOCK toàn bộ modules có side-effect trước khi require app ────────────────

// 1. Mock mysql2/promise pool — ngăn kết nối MySQL thật
//    user.repo.js gọi pool.query() nên ta mock module 'mysql2/promise'
jest.mock('../config/db', () => ({
    query: jest.fn(),
}));

// 2. Mock bcryptjs
jest.mock('bcryptjs', () => ({
    compare : jest.fn(),
    hash    : jest.fn(),
}));

// ─── Setup env test ────────────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV   = 'test';

// ─── Imports sau khi mock đã thiết lập ────────────────────────────────────────
const supertest    = require('supertest');
const bcrypt       = require('bcryptjs');
const pool         = require('../config/db');
const express      = require('express');
const cookieParser = require('cookie-parser');
const authRoutes   = require('../routes');  // routes/index.js

// ─── Mini-app Express chỉ chứa auth routes ────────────────────────────────────
// Middleware intercept res.render → trả JSON để supertest đọc được
const mockRenderMiddleware = (req, res, next) => {
    res.render = (view, data) => {
        res.json({ __view: view, __data: data });
    };
    next();
};

const buildApp = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(mockRenderMiddleware);
    app.use('/', authRoutes);
    return app;
};

// ─── Helper tạo mock user row (giống kết quả trả về từ MySQL) ─────────────────
const createMockUser = (overrides = {}) => ({
    id       : 1,
    full_name: 'Nguyen Van A',
    username : 'nguyenvana',
    password : '$2a$10$hashedpassword',
    role     : 'student',
    ...overrides,
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: POST /login
// ═══════════════════════════════════════════════════════════════════════════════

describe('POST /login', () => {
    let app;

    beforeAll(() => { app = buildApp(); });
    afterEach(() => { jest.clearAllMocks(); });

    // ── Happy Path ────────────────────────────────────────────────────────────
    describe('Happy Path', () => {
        it('302: Đăng nhập thành công (student) → redirect /dashboard + set cookie', async () => {
            const mockUser = createMockUser();
            // pool.query trả về [rows, fields]
            pool.query.mockResolvedValue([[mockUser], []]);
            bcrypt.compare.mockResolvedValue(true);

            const res = await supertest(app)
                .post('/login')
                .send({ username: 'nguyenvana', password: 'password123' });

            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/dashboard');
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/^token=/);
        });

        it('302: Admin đăng nhập → redirect /admin/dashboard', async () => {
            const mockAdmin = createMockUser({ role: 'admin' });
            pool.query.mockResolvedValue([[mockAdmin], []]);
            bcrypt.compare.mockResolvedValue(true);

            const res = await supertest(app)
                .post('/login')
                .send({ username: 'admin', password: 'adminpass' });

            expect(res.status).toBe(302);
            expect(res.headers.location).toBe('/admin/dashboard');
        });
    });

    // ── Validation Error ──────────────────────────────────────────────────────
    describe('Validation Error', () => {
        it('Thiếu username → render lỗi, không gọi DB', async () => {
            const res = await supertest(app)
                .post('/login')
                .send({ password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.__view).toBe('login');
            expect(res.body.__data.error).toMatch(/đủ thông tin/);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('Thiếu password → render lỗi, không gọi DB', async () => {
            const res = await supertest(app)
                .post('/login')
                .send({ username: 'nguyenvana' });

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toMatch(/đủ thông tin/);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('Username không tồn tại → render lỗi credentials', async () => {
            pool.query.mockResolvedValue([[], []]); // user không tìm thấy

            const res = await supertest(app)
                .post('/login')
                .send({ username: 'notexist', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toBeTruthy();
        });

        it('Password sai → render lỗi credentials', async () => {
            const mockUser = createMockUser();
            pool.query.mockResolvedValue([[mockUser], []]);
            bcrypt.compare.mockResolvedValue(false); // password KHÔNG khớp

            const res = await supertest(app)
                .post('/login')
                .send({ username: 'nguyenvana', password: 'wrongpassword' });

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toBeTruthy();
        });
    });

    // ── Internal Server Error ─────────────────────────────────────────────────
    describe('Internal Server Error (500)', () => {
        it('DB gặp sự cố → render lỗi, không crash server', async () => {
            pool.query.mockRejectedValue(new Error('DB connection lost'));

            const res = await supertest(app)
                .post('/login')
                .send({ username: 'nguyenvana', password: 'password123' });

            // Controller bắt lỗi trong catch → render lỗi thân thiện
            expect(res.status).toBe(200);
            expect(res.body.__data.error).toBeTruthy();
        });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: POST /register
// ═══════════════════════════════════════════════════════════════════════════════

describe.skip('POST /register', () => {
    let app;

    beforeAll(() => { app = buildApp(); });
    afterEach(() => { jest.clearAllMocks(); });

    const validPayload = {
        username : 'newuser',
        password : 'password123',
        full_name: 'Nguyen Van B',
    };

    // ── Happy Path ────────────────────────────────────────────────────────────
    describe('Happy Path', () => {
        it('302: Đăng ký thành công → redirect /login?success=...', async () => {
            // Lần 1: findByUsername → không tìm thấy (username chưa tồn tại)
            // Lần 2: INSERT → trả insertId
            pool.query
                .mockResolvedValueOnce([[], []])                         // findByUsername
                .mockResolvedValueOnce([{ insertId: 5 }, []]);          // create

            bcrypt.hash.mockResolvedValue('$2a$10$newhashedpassword');

            const res = await supertest(app)
                .post('/register')
                .send(validPayload);

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain('/login');
            // Phải đã hash password trước khi lưu
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        });
    });

    // ── Validation Error ──────────────────────────────────────────────────────
    describe('Validation Error', () => {
        it('Thiếu username → render lỗi, không gọi DB', async () => {
            const res = await supertest(app)
                .post('/register')
                .send({ ...validPayload, username: '' });

            expect(res.status).toBe(200);
            expect(res.body.__view).toBe('register');
            expect(res.body.__data.error).toMatch(/đủ thông tin/);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('Thiếu password → render lỗi, không gọi DB', async () => {
            const res = await supertest(app)
                .post('/register')
                .send({ ...validPayload, password: '' });

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toMatch(/đủ thông tin/);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('Thiếu full_name → render lỗi, không gọi DB', async () => {
            const res = await supertest(app)
                .post('/register')
                .send({ ...validPayload, full_name: '' });

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toMatch(/đủ thông tin/);
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('Username đã tồn tại → render lỗi trùng username', async () => {
            pool.query.mockResolvedValueOnce([[createMockUser()], []]); // username đã có

            const res = await supertest(app)
                .post('/register')
                .send(validPayload);

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toMatch(/tồn tại/);
            // Không được tạo user mới
            expect(pool.query).toHaveBeenCalledTimes(1);
        });
    });

    // ── Internal Server Error ─────────────────────────────────────────────────
    describe('Internal Server Error (500)', () => {
        it('DB.create() ném lỗi → render lỗi hệ thống', async () => {
            pool.query
                .mockResolvedValueOnce([[], []])                        // findByUsername OK
                .mockRejectedValueOnce(new Error('Disk full'));         // INSERT fail

            bcrypt.hash.mockResolvedValue('hashed');

            const res = await supertest(app)
                .post('/register')
                .send(validPayload);

            expect(res.status).toBe(200);
            expect(res.body.__data.error).toBeTruthy();
        });
    });
});
