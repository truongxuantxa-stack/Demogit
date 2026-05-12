# Changelog

## [Unreleased]
### Added
- **UI/UX**: Thêm tính năng Dynamic Placeholder cho ô nhập nội dung xin giấy giới thiệu (`views/create-request.ejs`). Tự động thay đổi placeholder hướng dẫn sinh viên tùy theo loại giấy (Thực tập, Liên hệ công tác, NCKH) được chọn.
- **Validation**: Bổ sung thuộc tính `required` ở client-side và thêm kiểm tra `.trim()` ở server-side (`controllers/request.controller.js`) để chặn việc gửi form trống hoặc chỉ nhập dấu cách.
- **UI/UX**: Đổi tên nhãn (label) từ "Nội dung chi tiết" thành "Lý do / Mục đích xin giấy" để giúp sinh viên dễ hiểu hơn về mục đích nhập liệu (`views/create-request.ejs`).
