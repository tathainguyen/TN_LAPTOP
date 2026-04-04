# ĐẶC TẢ HỆ THỐNG (SRS): NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ KINH DOANH THIẾT BỊ CÔNG NGHỆ

## 1. TỔNG QUAN DỰ ÁN
- **Mục tiêu:** Xây dựng website phân phối laptop và thiết bị công nghệ, hoạt động theo mô hình B2C.
- **Tính năng cốt lõi:** Quản lý hàng hóa theo cấu hình biến thể (Product Variants/SKUs), tích hợp cổng thanh toán trực tuyến (VNPAY Sandbox) và tự động hóa vận hành qua API giao nhận (GHN).

---

## 2. PHÂN HỆ KHÁCH HÀNG (CUSTOMER FRONTEND)

### 2.1. Xác thực & Tài khoản (Authentication & Profile)
- **Đăng nhập/Đăng ký:** - Đăng nhập truyền thống hoặc Đăng nhập mạng xã hội đa nền tảng (Google OAuth lấy avatar trực tiếp, và Facebook Login).
  - Tính năng **Quên mật khẩu**: Gửi mã OTP hoặc link đặt lại mật khẩu qua email.
- **Hồ sơ cá nhân:** - Cập nhật thông tin: Họ tên, SĐT, Giới tính, Ngày sinh.
  - Quản lý sổ địa chỉ (Thêm/Sửa/Xóa nhiều địa chỉ giao hàng).
  - Xác thực Email: Hiển thị trạng thái (Dấu X đỏ chưa xác thực / Tích xanh đã xác thực). Tích hợp API gửi email kèm link xác thực.
- **Quản lý Đơn mua & Voucher:** - Xem lịch sử đơn hàng, tổng tiền, mã vận đơn và trạng thái. 
  - Tính năng **Hủy đơn hàng**: Khách chỉ được phép click hủy khi đơn đang ở trạng thái "Chờ xác nhận".
  - Kho Voucher: Lưu trữ và xem các mã giảm giá hiện có.

### 2.2. Giao diện Mua sắm (Shopping Interface)
- **Trang chủ:**
  - Banner trượt quản lý động.
  - Gợi ý sản phẩm thông minh (hiển thị khi đã login).
  - Section Sản phẩm nổi bật (Top View) và Sản phẩm mới.
  - Section Tin tức công nghệ mới cập nhật.
- **Cửa hàng & Bộ lọc (Shop & Filter):**
  - Phân loại: Laptop Gaming, Văn phòng, Đồ họa - Thiết kế.
  - Bộ lọc động: Theo 6 hãng (Lenovo, Dell, Acer, MSI, Asus, HP), theo mức giá (5-10tr, 10-20tr, 20-30tr, trên 40tr).
  - Sắp xếp và tìm kiếm từ khóa theo tên.
- **Chi tiết Sản phẩm (Product Detail):**
  - Slider đa ảnh.
  - **Logic Biến thể cấu hình (Core Logic):** Hiển thị các tùy chọn cấu hình. Khi thay đổi cấu hình RAM/VGA, giá tiền tự động cập nhật realtime.
  - Thông số kỹ thuật chi tiết, chính sách bảo hành.
  - Gợi ý sản phẩm cùng phân khúc.
  - **Đánh giá (Review & Rating):** Áp dụng logic "Verified Purchase" (Đã mua hàng). Người dùng chỉ được phép đánh giá và chấm sao khi đã mua sản phẩm đó và đơn hàng phải ở trạng thái "Thành công".

### 2.3. Giỏ hàng & Thanh toán (Cart & Checkout)
- **Giỏ hàng:** - Hiển thị sản phẩm, Tên phiên bản cấu hình đã chọn, Số lượng, Đơn giá. Badge số lượng realtime.
  - **Logic Đồng bộ Giỏ hàng:** Giữ nguyên các sản phẩm khách đã chọn vào giỏ khi chưa đăng nhập, tự động đồng bộ đẩy vào tài khoản của khách sau khi đăng nhập thành công.
- **Thanh toán (Checkout Flow):**
  - Chọn địa chỉ giao hàng (hoặc tạo mới).
  - Tùy chọn phí vận chuyển tĩnh: Hỏa tốc (50k), Nhanh (30k), Tiết kiệm (20k).
  - **Logic Voucher:** Áp dụng Voucher giảm giá. Chỉ cho phép áp dụng tối đa 1 Voucher/đơn hàng. Hệ thống tự động kiểm tra: Thời hạn, Số lượt dùng còn lại, và Tổng tiền phải ≥ Giá trị tối thiểu của Voucher.
  - Lời nhắn cho Shop.
  - **Cổng thanh toán:** Chọn Thanh toán khi nhận hàng (COD) hoặc Thanh toán Online (Tích hợp VNPAY Sandbox bằng VNĐ).

### 2.4. Tin tức & Giao tiếp (Blog & Chat)
- **Tin tức:** Danh sách bài viết, tìm kiếm/lọc theo danh mục. Chi tiết bài viết cho phép User đã đăng nhập bình luận.
- **Live Chat:** Khung chat realtime kết nối trực tiếp với Admin (Sử dụng Socket.io).

---

## 3. PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN DASHBOARD)

### 3.1. Tổng quan (Dashboard)
- Hiển thị thống kê tổng quan (Đơn hàng, Sản phẩm, Thành viên).
- Biểu đồ Doanh thu (lọc theo ngày, tháng, năm).
- Thống kê Lợi nhuận = [Tổng tiền khách thanh toán] - [Đơn giá nhập vốn * Số lượng bán ra].
- Thống kê tồn kho theo từng phiên bản cấu hình (SKU).

### 3.2. Quản lý Hệ thống & User
- **Quản lý Người dùng:** Thêm mới thủ công, Khóa/Mở, Sửa thông tin (không can thiệp Pass). Hiển thị Email.
- **Quản lý Danh mục & Nhãn hàng:** Thêm/Sửa/Xóa.
- **Quản lý Banner & Tin tức:** Cập nhật nội dung bài viết.
- **Quản lý Đánh giá & Bình luận:** Xem toàn bộ bình luận và đánh giá. Quyền Ẩn/Xóa các bình luận spam, vi phạm.

### 3.3. Quản lý Kho & Sản phẩm 
- **Nhập hàng:** Tạo phiếu nhập yêu cầu chọn chính xác *Sản phẩm (Mã SKU cụ thể)*, nhập *Số lượng* và *Đơn giá vốn* để hệ thống tự động cộng dồn Tồn kho và làm cơ sở tính Lợi nhuận.
- **Quản lý Sản phẩm:** Bao gồm 2 phân hệ chính (Quản lý theo mô hình Dòng sản phẩm và SKU độc lập):
  1. **Danh sách Sản phẩm (Master List):**
     - Hiển thị danh sách **TẤT CẢ** các phiên bản laptop (SKU) hiện có trên hệ thống, không phân biệt hãng hay cấu hình.
     - **Bộ lọc tìm kiếm (Filters):** Bố trí ngay phía trên bảng, cho phép Admin lọc nhanh toàn bộ kho hàng theo:
       - *Danh mục:* Laptop Gaming, Laptop Văn phòng, Laptop Đồ họa - Thiết kế.
       - *Hãng (Brand):* Lenovo, Dell, Acer, MSI, Asus, HP.
     - **Các cột hiển thị:** STT, Tên sản phẩm (Tên phiên bản chi tiết), Danh mục, Hãng, Phân khúc, Lượt xem, Số lượng (Tồn kho), Trạng thái (Đang kích hoạt / Khóa).
     - **Thao tác (Actions):** - *Xem chi tiết:* Mở popup/trang chi tiết xem nhanh Giá gốc (niêm yết) và Giá được giảm (bán thực tế).
       - *Khóa/Mở bán:* Nút gạt (Toggle) ẩn/hiện sản phẩm.
       - *Sửa (Edit):* Chỉnh sửa toàn bộ thông tin (cấu hình, giá bán, xóa/tải lên lại hình ảnh mới).
  2. **Thêm Sản phẩm mới:**
     - Giao diện Form nhập liệu chuyên nghiệp. Hỗ trợ 2 bước: Chọn/Tạo "Dòng sản phẩm chung" (Hãng, Danh mục) và Khai báo "Phiên bản SKU" (Cấu hình chi tiết, Giá gốc, Giá bán, Upload Ảnh).
- **Quản lý Nhà cung cấp:** Lưu data đối tác.

### 3.4. Quản lý Kinh doanh & Vận hành (Sales & Operations)
- **Quản lý Voucher:** Tạo mã code, set loại giảm (%/VND), giá trị tối đa, số lượng lượt dùng, giá trị đơn tối thiểu, hạn sử dụng.
- **Quản lý Vận chuyển (Tĩnh):** Cấu hình 3 mức giá hiển thị ở Checkout (Hỏa tốc, Nhanh, Tiết kiệm).
- **Quản lý Đơn hàng & API GHN:**
  - Danh sách đơn hàng (Chờ xác nhận, Đã xác nhận, Đang giao, Thành công, Đã hủy).
  - **Logic Hủy đơn & Hoàn kho:** Bất kể Khách hàng tự hủy (khi chờ xác nhận) hay Admin hủy đơn, hệ thống phải tự động truy xuất các Phiên bản cấu hình (SKU) trong đơn đó và cộng trả lại số lượng vào Tồn kho.
  - **Tích hợp GHN:** Tại màn hình Chi tiết đơn hàng, khi duyệt thành "Đã xác nhận", Admin nhập kích thước gói hàng và ấn "Đẩy đơn sang GHN". Gọi API GHN lấy `tracking_code` (Mã Vận Đơn) gán ngược vào đơn. Tiền cước thực tế shop tự xử lý với GHN.
- **Quản lý Tin nhắn:** Chat realtime với khách. 
- **Báo cáo:** Trích xuất (Export Excel) mọi bảng dữ liệu.

## 4. TIÊU CHUẨN CẤU TRÚC MÃ NGUỒN (PROJECT STRUCTURE STRATEGY)
AI đóng vai trò là Senior Developer. Khi sinh ra bất kỳ đoạn code nào, AI bắt buộc phải ghi rõ ĐƯỜNG DẪN THƯ MỤC TƯƠNG ĐỐI (Ví dụ: `backend/src/controllers/authController.js`) trước khối code. Tuyệt đối không viết gộp code vào một file lớn. Phải tuân thủ nghiêm ngặt cấu trúc chia rẽ rạch ròi sau:

### 4.1. Cấu trúc Backend (Node.js / Express / MySQL)
Áp dụng tư duy chia lớp (Layered Architecture):
- `/config`: Chứa các cấu hình hệ thống (Kết nối MySQL, cấu hình VNPAY, Mailer).
- `/models`: Chứa các hàm giao tiếp trực tiếp với Database (Các câu lệnh SQL Query).
- `/controllers`: Chứa logic nghiệp vụ cốt lõi (Xử lý dữ liệu, tính toán, rẽ nhánh).
- `/routes`: Chỉ chứa các đường dẫn API (Endpoints) và điều hướng đến Controllers.
- `/middlewares`: Chứa các lớp khiên bảo vệ (Xác thực JWT Auth, Phân quyền Admin).
- `/utils`: Các hàm công cụ dùng chung (Tạo mã OTP, xử lý format ngày tháng).

### 4.2. Cấu trúc Frontend (ReactJS / Vite)
- `/src/pages`: Chứa các trang giao diện hoàn chỉnh (Home, Cart, AdminDashboard).
- `/src/components`: Chứa các mảnh UI nhỏ, dùng lại nhiều lần (Header, Footer, ProductCard, Button).
- `/src/services`: Chứa các file chuyên gọi API bằng Axios (authService.js, productService.js). Tuyệt đối không gọi API trực tiếp trong component.
- `/src/utils`: Chứa các hàm tiện ích Frontend (Format tiền tệ VNĐ, validate form).
- `/src/context` (hoặc Redux): Chứa các State dùng chung toàn cục (Ví dụ: Thông tin User đang đăng nhập, Dữ liệu Giỏ hàng).