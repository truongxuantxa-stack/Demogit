# Hệ thống Xin Giấy Giới Thiệu Sinh Viên

Đây là một ứng dụng Web Fullstack (Node.js + Express + MySQL + EJS) hỗ trợ quản lý quy trình xin và cấp giấy giới thiệu cho sinh viên.

## Chức năng
- **Sinh viên:** Đăng ký, đăng nhập, gửi yêu cầu xin giấy giới thiệu, xem danh sách yêu cầu, và tải file PDF khi được duyệt.
- **Admin/Cán bộ:** Đăng nhập, quản lý tất cả yêu cầu, duyệt hoặc từ chối yêu cầu. Hệ thống tự động tạo file PDF khi duyệt.

## Cấu trúc thư mục
- `config/`: Cấu hình database.
- `controllers/`: Xử lý HTTP request & response.
- `middlewares/`: Kiểm tra Authentication (JWT) và Authorization (Role).
- `repositories/`: Giao tiếp trực tiếp với MySQL (Data Access Layer).
- `services/`: Xử lý logic nghiệp vụ và gọi `pdfkit` để sinh PDF.
- `routes/`: Định tuyến API và Frontend.
- `utils/`: Chứa các hàm tiện ích như `pdf.util.js`.
- `views/`: Chứa giao diện EJS sử dụng Bootstrap 5.
- `public/`: Thư mục lưu trữ file tĩnh (đặc biệt là PDF).
- `server.js`: File khởi chạy server Express.
- `init.js`: Script khởi tạo cấu trúc CSDL tự động.

## Hướng dẫn chạy dự án

1. **Cài đặt thư viện:**
   Mở terminal trong thư mục dự án và chạy:
   ```bash
   npm install
   ```

2. **Cấu hình CSDL:**
   Đảm bảo bạn có file `.env` với các thông tin kết nối MySQL.
   
3. **Khởi tạo Database:**
   Chạy lệnh sau để tự động tạo database `student_request_system` và các bảng cần thiết, cũng như tài khoản admin mặc định:
   ```bash
   node init.js
   ```

4. **Khởi động Server:**
   Dùng lệnh sau để chạy:
   ```bash
  
   ``` node server.js

5. **Sử dụng hệ thống:**
   - Truy cập vào: `http://localhost:3000`
   - **Tài khoản Admin mặc định:** 
     - Username: `admin`
     - Password: `admin123`
   - **Tài khoản Sinh viên:** Bạn có thể tự bấm nút "Đăng ký" trên màn hình.
