import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import { getAdminOrderDetail } from '../../services/order/orderService.js';

const FALLBACK_IMAGE = 'https://via.placeholder.com/120x80?text=No+Image';
const STATUS_STEPS = ['PENDING_CONFIRM', 'CONFIRMED', 'SHIPPING', 'SUCCESS'];

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getOrderStatusLabel(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'PENDING_CONFIRM') return 'Chờ xác nhận';
  if (key === 'CONFIRMED') return 'Đã xác nhận';
  if (key === 'SHIPPING') return 'Đang giao';
  if (key === 'SUCCESS') return 'Thành công';
  if (key === 'CANCELLED') return 'Đã hủy';
  return key || '-';
}

function getOrderStatusClass(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'SUCCESS') return 'customer-status-chip customer-status-chip--success';
  if (key === 'CANCELLED') return 'customer-status-chip customer-status-chip--danger';
  if (key === 'SHIPPING') return 'customer-status-chip customer-status-chip--info';
  if (key === 'CONFIRMED') return 'customer-status-chip customer-status-chip--primary';
  return 'customer-status-chip customer-status-chip--warning';
}

function getPaymentMethodLabel(method) {
  const key = String(method || '').toUpperCase();
  if (key === 'COD') return 'Thanh toán khi nhận hàng (COD)';
  if (key === 'ONLINE') return 'Thanh toán online';
  return key || '-';
}

function getPaymentStatusLabel(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'UNPAID') return 'Chưa thanh toán';
  if (key === 'PAID') return 'Đã thanh toán';
  if (key === 'FAILED') return 'Thanh toán thất bại';
  if (key === 'REFUNDED') return 'Đã hoàn tiền';
  return key || '-';
}

function getTimelineStatus(orderStatus, step) {
  const current = String(orderStatus || '').toUpperCase();
  if (current === 'CANCELLED') return 'cancelled';

  const currentIndex = STATUS_STEPS.indexOf(current);
  const stepIndex = STATUS_STEPS.indexOf(step);

  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

function AdminOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    async function loadDetail() {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getAdminOrderDetail(id);
        setOrder(response?.data || null);
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải chi tiết đơn hàng.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  const itemSubtotal = useMemo(
    () => (order?.items || []).reduce((sum, item) => sum + Number(item.line_total || 0), 0),
    [order?.items]
  );

  return (
    <AdminLayout title={order ? `Chi tiết đơn ${order.order_code}` : 'Chi tiết đơn hàng'}>
      {loading ? (
        <section className="admin-panel">
          <div className="admin-loading">Đang tải chi tiết đơn hàng...</div>
        </section>
      ) : !order ? (
        <section className="admin-panel">
          <div className="admin-empty">Không tìm thấy đơn hàng.</div>
          <button type="button" className="admin-btn admin-btn--edit" onClick={() => navigate('/admin/orders')}>
            Quay lại danh sách đơn
          </button>
        </section>
      ) : (
        <section className="customer-card customer-order-detail admin-order-detail-page">
          <div className="customer-card-head customer-order-detail-head customer-order-detail-head--wide">
            <div>
              <h2>Chi tiết đơn hàng {order.order_code}</h2>
              <p>
                Ngày tạo: {formatDate(order.created_at)}
                {' · '}
                Trạng thái: <span className={getOrderStatusClass(order.order_status)}>{getOrderStatusLabel(order.order_status)}</span>
              </p>
            </div>
            <div className="customer-order-detail-head-actions">
              <Link to="/admin/orders" className="customer-order-back-link">Quay lại đơn hàng</Link>
            </div>
          </div>

          <div className="customer-order-timeline-wrap">
            <ol className="customer-order-timeline" aria-label="Tiến trình đơn hàng">
              {STATUS_STEPS.map((step) => {
                const timelineState = getTimelineStatus(order.order_status, step);
                return (
                  <li key={step} className={`customer-order-timeline-item is-${timelineState}`}>
                    <span className="customer-order-timeline-dot" />
                    <span className="customer-order-timeline-label">{getOrderStatusLabel(step)}</span>
                  </li>
                );
              })}
            </ol>
            {String(order.order_status || '').toUpperCase() === 'CANCELLED' ? (
              <p className="customer-order-cancel-note">Đơn hàng đã bị hủy.</p>
            ) : null}
          </div>

          <div className="customer-order-detail-stack admin-order-detail-stack">
            <article className="customer-order-detail-side admin-order-extra-card">
              <h3>Lịch sử trạng thái</h3>
              {(order.status_histories || []).length === 0 ? (
                <p>Chưa có lịch sử thay đổi trạng thái.</p>
              ) : (
                <ul className="admin-order-history-list">
                  {order.status_histories.map((history) => (
                    <li key={history.id}>
                      <p>
                        <strong>{getOrderStatusLabel(history.old_status)}</strong>
                        {' -> '}
                        <strong>{getOrderStatusLabel(history.new_status)}</strong>
                      </p>
                      <p>Thời gian: {formatDate(history.created_at)}</p>
                      <p>Thao tác bởi: {history.changed_by_name || 'Hệ thống'}</p>
                      {history.note ? <p>Ghi chú: {history.note}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="customer-order-detail-side admin-order-extra-card">
              <h3>Thông tin khách hàng đặt đơn</h3>
              <p>Tên khách hàng: <strong>{order.customer_name || '-'}</strong></p>
              <p>Email: <strong>{order.customer_email || '-'}</strong></p>
              <p>Số điện thoại TK: <strong>{order.customer_phone || '-'}</strong></p>
            </article>

            <article className="customer-order-detail-side">
              <h3>Thông tin nhận hàng</h3>
              <p><strong>{order.recipient_name}</strong> - {order.recipient_phone}</p>
              <p>{order.address_line}, {order.ward}, {order.district}, {order.province}</p>
              {order.address_note ? <p>Ghi chú địa chỉ: {order.address_note}</p> : null}
              {order.customer_note ? <p>Lời nhắn: {order.customer_note}</p> : null}
            </article>

            <article className="customer-order-detail-card">
              <h3>Sản phẩm trong đơn</h3>
              {(order.items || []).length === 0 ? (
                <p className="customer-empty-row">Đơn hàng chưa có sản phẩm.</p>
              ) : (
                <div className="customer-order-item-list">
                  {order.items.map((item) => (
                    <article className="customer-order-item" key={item.id}>
                      <img
                        src={item.primary_image || FALLBACK_IMAGE}
                        alt={item.product_name || 'Sản phẩm'}
                        className="customer-order-item-thumb"
                      />
                      <div className="customer-order-item-info">
                        <p className="customer-order-item-name">{item.product_name}</p>
                        {item.variant_name ? <p className="customer-order-item-variant">{item.variant_name}</p> : null}
                        <p className="customer-order-item-sku">SKU: {item.sku || '-'}</p>
                      </div>
                      <p className="customer-order-item-price">{formatVnd(item.unit_price)}</p>
                      <p className="customer-order-item-qty">x{item.quantity}</p>
                      <p className="customer-order-item-total">{formatVnd(item.line_total)}</p>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <div className="admin-order-payment-row">
              <article className="customer-order-detail-side">
                <h3>Thanh toán và vận chuyển</h3>
                <p>Mã đơn hàng: <strong>{order.order_code || '-'}</strong></p>
                <p>Mã vận đơn: <strong>{order.tracking_code || 'Đang cập nhật'}</strong></p>
                <p>Phương thức thanh toán: <strong>{getPaymentMethodLabel(order.payment_method)}</strong></p>
                <p>Trạng thái thanh toán: <strong>{getPaymentStatusLabel(order.payment_status)}</strong></p>
                <p>Phương thức vận chuyển: <strong>{order.shipping_method_name || '-'}</strong></p>
                <p>Mã voucher đã dùng: <strong>{order.voucher_code || '-'}</strong></p>
              </article>

              <article className="customer-order-summary">
                <h3>Tổng thanh toán</h3>
                <p><span>Tạm tính</span><strong>{formatVnd(itemSubtotal || order.total_items_amount)}</strong></p>
                <p><span>Giảm giá voucher</span><strong>- {formatVnd(order.voucher_discount)}</strong></p>
                <p><span>Phí vận chuyển</span><strong>{formatVnd(order.shipping_fee)}</strong></p>
                <p className="customer-order-summary-total"><span>Tổng thanh toán</span><strong>{formatVnd(order.grand_total)}</strong></p>
              </article>
            </div>
          </div>
        </section>
      )}
    </AdminLayout>
  );
}

export default AdminOrderDetail;
