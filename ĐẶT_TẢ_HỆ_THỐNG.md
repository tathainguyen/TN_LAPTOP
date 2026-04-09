# ĐẶC TẢ HỆ THỐNG (SRS) - CẬP NHẬT THEO TIẾN ĐỘ THỰC TẾ

## 1. TỔNG QUAN DỰ ÁN
- Mục tiêu: Xây dựng website thương mại điện tử bán laptop và thiết bị công nghệ theo mô hình B2C.
- Trọng tâm nghiệp vụ: Quản lý sản phẩm theo mô hình Dòng sản phẩm (Group) + SKU cấu hình chi tiết.
- Trạng thái hiện tại: Đã hoàn thành xác thực, phân quyền, quản trị danh mục/người dùng/sản phẩm, giỏ hàng, checkout COD, đơn hàng và voucher checkout chạy dữ liệu thật.
- Hạng mục còn lại lớn: VNPAY, GHN vận chuyển thực tế, hoàn kho tự động khi hủy đơn, blog, chat realtime, review.

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
  - Cart/Order/Order items/Order status histories.
  - Shipping methods/carriers.
  - Voucher types/vouchers (áp dụng tại checkout).

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
- Giỏ hàng:
  - Thêm vào giỏ từ trang sản phẩm.
  - Cập nhật số lượng/xóa sản phẩm.
  - Hỗ trợ giỏ khách (localStorage) và đồng bộ sang user khi đăng nhập.
- Checkout COD:
  - Lấy dữ liệu checkout (địa chỉ + phương thức vận chuyển) từ API thật.
  - Tạo đơn COD từ giỏ hàng.
  - Danh sách đơn mua và trang chi tiết đơn mua chạy dữ liệu thật.
  - Khách hàng hủy đơn ở trạng thái PENDING_CONFIRM.
- Voucher tại checkout:
  - Lấy danh sách voucher khả dụng theo giá trị đơn hàng.
  - Kiểm tra mã voucher theo điều kiện hoạt động/thời gian/giá trị đơn tối thiểu/giới hạn lượt dùng.
  - Áp dụng giảm giá vào đơn COD và ghi nhận used_count.

### 3.1.2. Đang ở mức giao diện/demo
- Kho voucher trong trang tài khoản khách hàng (Customer Vouchers) vẫn đang dùng dữ liệu mẫu, chưa nối API thật.

### 3.1.3. Chưa triển khai
- Đăng nhập Google/Facebook.
- Thanh toán online VNPAY thực tế.
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
- Quản lý vận chuyển:
  - CRUD phương thức vận chuyển.
  - CRUD hãng vận chuyển.
- Quản lý voucher:
  - CRUD loại voucher (voucher types).
  - CRUD mã voucher (voucher codes).
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

### 3.3.1. Đã chạy thật end-to-end
- Giỏ hàng:
  - API lấy giỏ, thêm/cập nhật/xóa item, clear cart, sync guest cart.
- Checkout + đơn COD:
  - API checkout-data (địa chỉ + phương thức vận chuyển).
  - API tạo đơn COD từ cart.
  - API đơn khách hàng (danh sách/chi tiết/hủy đơn).
  - API đơn admin (danh sách/chi tiết/cập nhật trạng thái).
- Voucher checkout:
  - API danh sách voucher khả dụng.
  - API validate voucher theo giá trị đơn hàng.

### 3.3.2. Trạng thái vận hành hiện tại
- Checkout hiện hỗ trợ thanh toán COD.
- Có áp voucher thật tại checkout.
- Trạng thái đơn cập nhật được từ admin.
- Chưa có hoàn kho tự động khi đơn chuyển CANCELLED.

### 3.3.3. Chưa triển khai nghiệp vụ chạy thật
- Thanh toán VNPAY sandbox.
- Hoàn kho tự động khi hủy đơn.
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
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
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
  - Hủy đơn (PATCH /orders/customer/:orderId/cancel).
  - Tạo đơn COD (POST /orders/cod).
- Admin:
  - Danh sách đơn, lọc, phân trang (GET /orders/admin).
  - Chi tiết đơn hàng (GET /orders/admin/:id).
  - Cập nhật trạng thái đơn (PATCH /orders/admin/:id/status).
- Shared:
  - Dữ liệu checkout (GET /orders/checkout-data).

### 4.5. Products
- Admin:
  - Master data.
  - CRUD Product Group.
  - Upload ảnh sản phẩm.
  - CRUD SKU, đổi trạng thái, xóa.
- Storefront:
  - Danh sách sản phẩm.
  - Chi tiết sản phẩm theo slug.

### 4.6. Cart
- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/:productId
- DELETE /api/cart/items/:productId
- POST /api/cart/sync
- POST /api/cart/clear

### 4.7. Shipping
- GET /api/shipping/methods
- POST /api/shipping/methods
- PUT /api/shipping/methods/:id
- DELETE /api/shipping/methods/:id
- GET /api/shipping/carriers
- POST /api/shipping/carriers
- PUT /api/shipping/carriers/:id
- DELETE /api/shipping/carriers/:id

### 4.8. Vouchers
- GET /api/vouchers/types
- POST /api/vouchers/types
- PUT /api/vouchers/types/:id
- DELETE /api/vouchers/types/:id
- GET /api/vouchers/codes
- POST /api/vouchers/codes
- PUT /api/vouchers/codes/:id
- DELETE /api/vouchers/codes/:id
- GET /api/vouchers/checkout/available
- POST /api/vouchers/checkout/validate

---

## 5. ĐÁNH GIÁ TIẾN ĐỘ TỔNG THỂ
- Nền tảng kỹ thuật: ổn định, phân lớp rõ ràng.
- Nhóm chức năng đã usable:
  - Auth + phân quyền.
  - Tài khoản khách hàng (profile/password/address/email verification).
  - Quản trị user/catalog/product/order/shipping/voucher.
  - Cart + checkout COD + áp voucher checkout + đơn hàng khách/admin.
  - Tailwind CSS styling infrastructure.
- Nhóm chức năng chưa hoàn tất end-to-end:
  - Thanh toán online (VNPAY).
  - GHN vận chuyển thực tế.
  - Hoàn kho tự động khi hủy đơn.
  - Blog/Chat/Review.
- Mức hoàn thành ước tính theo phạm vi SRS ban đầu: khoảng 65% - 75%.

---

## 6. ƯU TIÊN TRIỂN KHAI GIAI ĐOẠN TIẾP THEO
1. Tích hợp thanh toán online VNPAY sandbox cho checkout.
2. Bổ sung hoàn kho tự động khi đơn chuyển CANCELLED.
3. Tích hợp GHN lấy tracking_code và đồng bộ trạng thái giao hàng.
4. Chuyển trang "Kho voucher" phía tài khoản khách hàng từ mock sang API thật.
5. Hoàn thiện dashboard thống kê thật cho admin.
6. Triển khai blog, chat realtime và review theo lộ trình.
