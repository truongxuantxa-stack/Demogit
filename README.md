# Hệ thống Xin Giấy Giới Thiệu Sinh Viên

Đây là một ứng dụng Web Fullstack (Node.js + Express + MySQL + EJS) hỗ trợ quản lý quy trình xin và cấp giấy giới thiệu cho sinh viên.

## Chức năng
- **Sinh viên:** Đăng nhập, gửi yêu cầu xin giấy giới thiệu, xem danh sách yêu cầu, và tải file PDF khi được duyệt.
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
- `seed.js`: Script chèn dữ liệu mẫu (Tài khoản sinh viên và cán bộ) vào CSDL.

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

4. **Tạo dữ liệu mẫu (Seeder):**
   Chạy lệnh sau để thêm tài khoản admin và các tài khoản sinh viên mẫu:
   ```bash
   npm run seed
   ```

5. **Khởi động Server:**
   Dùng lệnh sau để chạy:
   ```bash
   node server.js
   ```

6. **Sử dụng hệ thống:**
   - Truy cập vào: `http://localhost:3000`
   - **Tài khoản Cán bộ (Admin):** 
     - Username: `CB_MOTCUA`
     - Password: `123456`
   - **Tài khoản Sinh viên mẫu:** 
     - Username: `0241967` (Mật khẩu: `Khanh@12092004`)
     - Username: `0241968` (Mật khẩu: `Hoa@15032004`)
     - (Tham khảo file `seed.js` để xem danh sách đầy đủ các tài khoản khác).

## Changelog / Lịch sử cập nhật
### [Unreleased]
#### Added
- **UI/UX**: Thêm tính năng Dynamic Placeholder cho ô nhập nội dung xin giấy giới thiệu (`views/create-request.ejs`). Tự động thay đổi placeholder hướng dẫn sinh viên tùy theo loại giấy (Thực tập, Liên hệ công tác, NCKH) được chọn.
- **Validation**: Bổ sung thuộc tính `required` ở client-side và thêm kiểm tra `.trim()` ở server-side (`controllers/request.controller.js`) để chặn việc gửi form trống hoặc chỉ nhập dấu cách.
- **UI/UX**: Đổi tên nhãn (label) từ "Nội dung chi tiết" thành "Lý do / Mục đích xin giấy" để giúp sinh viên dễ hiểu hơn về mục đích nhập liệu (`views/create-request.ejs`).
- **Auth/Security**: Vô hiệu hóa chức năng Đăng ký tài khoản mới (ẩn nút UI ở `login.ejs`, `header.ejs` và khóa API `/register` ở `routes/index.js`) để đảm bảo hệ thống phản ánh đúng quy trình thực tế của trường học.
- **Auth**: Cập nhật lưu trữ `full_name` vào payload của JWT Token khi đăng nhập thành công (`services/auth.service.js`).
- **UI**: Cập nhật thanh điều hướng hiển thị đúng Họ Tên và MSSV của sinh viên đang đăng nhập: `Xin chào, Nguyễn Văn Khánh - 0241967` (`views/partials/header.ejs`).
- **Database**: Bổ sung tính năng tự động khởi tạo dữ liệu mẫu (Seeder) thông qua lệnh `npm run seed` để khởi tạo trước 1 tài khoản cán bộ và 7 tài khoản sinh viên (`seed.js`).
- **Testing**: Cập nhật Unit Test, bỏ qua (`skip`) các test liên quan đến `/register` do tính năng này đã bị vô hiệu hóa (`tests/auth.controller.test.js`).
