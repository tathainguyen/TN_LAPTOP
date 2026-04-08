# ĐẶC TẢ HỆ THỐNG (SRS) - CẬP NHẬT THEO TIẾN ĐỘ THỰC TẾ

## 1. TỔNG QUAN DỰ ÁN
- Mục tiêu: Xây dựng website thương mại điện tử bán laptop và thiết bị công nghệ theo mô hình B2C.
- Trọng tâm nghiệp vụ: Quản lý sản phẩm theo mô hình Dòng sản phẩm (Group) + SKU cấu hình chi tiết.
- Trạng thái hiện tại: Đã hoàn thành nền tảng xác thực, phân quyền, quản trị danh mục, quản trị người dùng, quản trị sản phẩm và phần lớn trang tài khoản khách hàng.
- Hạng mục còn lại lớn: Giỏ hàng, checkout, đơn hàng thực tế, VNPAY, GHN, blog, chat realtime, review.

---

## 2. CÔNG NGHỆ VÀ KIẾN TRÚC ĐANG DÙNG

### 2.1. Frontend
- React 19, React Router 7, Vite 8.
- Axios gọi API.
- React Hot Toast hiển thị thông báo.
- Lucide React icon (v1.7.0).
- Tailwind CSS v4.2.2 via @tailwindcss/vite plugin làm framework UI chính, kết hợp với các component tự build.
- Quy ước UI: ưu tiên utility class của Tailwind; CSS file chỉ dùng cho phần legacy và component-specific style (modal, table, form layout).
- Cấu trúc thư mục đã tách theo domain:
  - pages: admin, auth, customer, store.
  - components: admin, layout, store.
  - services: auth, user, address, product, catalog, order.

### 2.2. Backend
- Node.js + Express 5.
- MySQL/MariaDB qua mysql2.
- JWT (jsonwebtoken) cho xác thực phiên.
- bcryptjs cho mã hóa mật khẩu.
- Nodemailer cho email xác thực.
- Multer + Cloudinary cho upload ảnh sản phẩm.
- dotenv cho cấu hình môi trường.
- Cấu trúc tách lớp: routes, controllers, models, middlewares, config.

### 2.3. Cơ sở dữ liệu
- DB schema đã có các bảng cho roadmap đầy đủ: users, roles, addresses, brands, categories, product_groups, products, product_images, carts, orders, vouchers, blog, chat, ghn_shipments...
- Nhóm bảng đang khai thác chính ở giai đoạn hiện tại:
  - Auth/User/Address.
  - Catalog (Brand/Category).
  - Product (Group/SKU/Image).

---

## 3. TIẾN ĐỘ CHỨC NĂNG THEO PHÂN HỆ

## 3.1. PHÂN HỆ KHÁCH HÀNG (CUSTOMER)

### 3.1.1. Đã hoàn thành
- Đăng ký tài khoản bằng email/mật khẩu.
- Đăng nhập truyền thống.
- Phân quyền sau đăng nhập:
  - Admin chỉ vào khu vực admin.
  - Customer chỉ vào khu vực storefront/account.
- Tài khoản khách hàng:
  - Cập nhật hồ sơ cá nhân (họ tên, SĐT, giới tính, ngày sinh).
  - Đổi mật khẩu.
  - Quản lý sổ địa chỉ (thêm/sửa/xóa/đặt mặc định).
- Xác thực email hoàn chỉnh:
  - Gửi mail xác thực thật qua Nodemailer.
  - Xác thực bằng link token có hạn.
  - Trang kết quả xác thực thành công/thất bại.
  - Chống spam gửi lại email: giới hạn 30 giây theo tài khoản, trả về Retry-After và retry_after_seconds.
- Trang Home lấy danh sách sản phẩm từ API thật.
- Trang Product có phân trang cơ bản.
- Trang Product Detail:
  - Hiển thị đa ảnh theo SKU.
  - Chuyển SKU cùng group theo danh sách cấu hình.
  - Hiển thị giá và thông số theo SKU hiện tại.

### 3.1.2. Đang ở mức giao diện/demo
- Danh sách đơn mua hiện đang lấy từ API, nút "Xem chi tiết" có sẵn nhưng chỉ khi có dữ liệu thực từ checkout.
- Kho voucher hiện đang dùng dữ liệu mẫu.
- Nút Thêm vào giỏ hàng ở Product Detail chưa nối nghiệp vụ giỏ hàng thật.

### 3.1.3. Chưa triển khai
- Trang chi tiết đơn mua (hiển thị sản phẩm, giá, địa chỉ, trạng thái chi tiết).
- Đăng nhập Google/Facebook.
- Quên mật khẩu bằng OTP hoặc link reset.
- Đồng bộ giỏ hàng khách vãng lai sang tài khoản sau đăng nhập.
- Luồng checkout thực tế.
- Thanh toán COD/VNPAY thực tế.
- Đánh giá sản phẩm theo điều kiện Verified Purchase.

## 3.2. PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN)

### 3.2.1. Đã hoàn thành
- Route guard phân quyền admin ở frontend.
- Trang hồ sơ admin riêng.
- Quản lý người dùng:
  - Danh sách, tìm kiếm, lọc, phân trang.
  - Nút "Chi tiết" xem hoạt động của khách hàng (danh sách đơn + bình luận sản phẩm).
  - Sửa thông tin.
  - Khóa/mở trạng thái.
  - Xóa người dùng.
  - Tạo người dùng thủ công.
  - Xuất Excel danh sách người dùng.
- Quản lý danh mục:
  - Brand: thêm/sửa/xóa/đổi trạng thái.
  - Category: thêm/sửa/xóa/đổi trạng thái.
- Quản lý sản phẩm theo Group + SKU:
  - CRUD Product Group.
  - CRUD SKU.
  - Bật/tắt trạng thái Group/SKU.
  - Upload nhiều ảnh SKU lên Cloudinary.
  - Form tạo sản phẩm thiết kế responsive, gọn gọn với grid layout (3 cột → 2 → 1).
  - Icon button (Upload icon) cho chọn file ảnh thay vì text label.
- Quản lý đơn hàng:
  - Danh sách đơn, tìm kiếm, lọc theo trạng thái đơn/trạng thái thanh toán, phân trang.
  - Cập nhật trạng thái đơn (PENDING_CONFIRM → CONFIRMED → SHIPPING → SUCCESS/CANCELLED).
  - Hiển thị status chip color-coded theo trạng thái.
- UI Styling:
  - Tích hợp Tailwind CSS 4.2 vào Vite + React.
  - Search button styled consistent với Tailwind utility class (SEARCH_BUTTON_TW) trên các trang list.
  - Status chip color mapping semantik (Success/Danger/Warning/Info/Primary).

### 3.2.2. Đang ở mức cơ bản
- Dashboard tổng quan mới hiển thị số tĩnh, chưa lấy dữ liệu thống kê thật.

### 3.2.3. Chưa triển khai
- Quản lý banner.
- Quản lý tin tức/blog.
- Quản lý review/bình luận.
- Quản lý nhà cung cấp.
- Quản lý nhập hàng và giá vốn.
- Báo cáo doanh thu/lợi nhuận/tồn kho chuẩn nghiệp vụ.

## 3.3. GIỎ HÀNG, ĐƠN HÀNG, THANH TOÁN, VẬN CHUYỂN

### 3.3.1. Backend API được xây dựng sẵn
- API lấy danh sách đơn của khách (GET /orders/customer).
- API lấy chi tiết đơn hàng (GET /orders/customer/:id).
- API tạo đơn COD từ cart (POST /orders/cod).
- API quản lý đơn (lọc, cập nhật trạng thái).

### 3.3.2. Frontend UI được xây dựng sẵn
- Trang danh sách đơn mua của khách với nút "Xem chi tiết" (chỉ hiển thị khi có dữ liệu thực).
- Trang chi tiết đơn mua (bổ sung trong giai đoạn tiếp theo).

### 3.3.3. Chưa triển khai nghiệp vụ chạy thật
- Giỏ hàng đầy đủ.
- Checkout và tạo đơn.
- Áp voucher thật trong đơn.
- Thanh toán VNPAY sandbox.
- Quản lý trạng thái đơn hàng thực tế.
- Hủy đơn và hoàn kho tự động.
- Tích hợp GHN lấy tracking_code.

## 3.4. BLOG VÀ CHAT

### 3.4.1. Trạng thái
- Chưa triển khai frontend/backend chạy thật.
- Database đã có cấu trúc bảng để phát triển ở giai đoạn tiếp theo.

---

## 4. API HIỆN CÓ (ĐANG HOẠT ĐỘNG)

### 4.1. Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/send-verification-email
- GET /api/auth/verify-email

### 4.2. Users
- Admin: master-data, danh sách, tạo, xem chi tiết, cập nhật, đổi trạng thái, xóa.
- Customer: cập nhật profile, đổi mật khẩu.
- Address: danh sách, thêm, sửa, xóa địa chỉ khách hàng.

### 4.3. Catalog
- Brand: danh sách, tạo, cập nhật, đổi trạng thái, xóa.
- Category: danh sách, tạo, cập nhật, đổi trạng thái, xóa.

### 4.4. Orders
- Customer:
  - Danh sách đơn hàng (GET /orders/customer).
  - Chi tiết đơn hàng (GET /orders/customer/:id).
  - Tạo đơn COD (POST /orders/cod).
- Admin:
  - Danh sách đơn, lọc, phân trang (GET /orders/admin).
  - Cập nhật trạng thái đơn (PATCH /orders/admin/:id/status).

### 4.5. Products
- Admin:
  - Master data.
  - CRUD Product Group.
  - Upload ảnh sản phẩm.
  - CRUD SKU, đổi trạng thái, xóa.
- Storefront:
  - Danh sách sản phẩm.
  - Chi tiết sản phẩm theo slug.

---

## 5. ĐÁNH GIÁ TIẾN ĐỘ TỔNG THỂ
- Nền tảng kỹ thuật: ổn định, phân lớp rõ ràng.
- Nhóm chức năng đã usable:
  - Auth + phân quyền.
  - Tài khoản khách hàng (profile/password/address/email verification).
  - Quản trị user/catalog/product/order.
  - Tailwind CSS styling infrastructure.
- Nhóm chức năng chưa hoàn tất end-to-end:
  - Cart → Checkout → Payment → Order → Shipping.
- Mức hoàn thành ước tính theo phạm vi SRS ban đầu: khoảng 50% - 60%.

---

## 6. ƯU TIÊN TRIỂN KHAI GIAI ĐOẠN TIẾP THEO
1. Hoàn thiện trang chi tiết đơn mua (xem sản phẩm, giá, địa chỉ, trạng thái chi tiết).
2. Hoàn thiện giỏ hàng và đồng bộ giỏ hàng guest.
3. Hoàn thiện checkout và tạo đơn hàng.
4. Tích hợp thanh toán VNPAY sandbox.
5. Triển khai trạng thái đơn hàng và hoàn kho khi hủy.
6. Tích hợp GHN để lấy tracking_code.
7. Chuyển Kho voucher từ mock sang API thật.
8. Hoàn thiện dashboard thống kê thật cho admin.
