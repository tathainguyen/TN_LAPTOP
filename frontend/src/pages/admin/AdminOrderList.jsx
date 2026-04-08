import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import { getAdminOrders, updateAdminOrderStatus } from '../../services/order/orderService.js';

const LIMIT = 10;

const ORDER_STATUS_OPTIONS = [
  { value: 'PENDING_CONFIRM', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'SUCCESS', label: 'Thành công' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'REFUNDED', label: 'Hoàn tiền' },
];

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function getOrderStatusLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = ORDER_STATUS_OPTIONS.find((item) => item.value === key);
  return found?.label || key || '-';
}

function getPaymentStatusLabel(value) {
  const key = String(value || '').toUpperCase();
  const found = PAYMENT_STATUS_OPTIONS.find((item) => item.value === key);
  return found?.label || key || '-';
}

function getOrderStatusClass(value) {
  const key = String(value || '').toUpperCase();
  if (key === 'SUCCESS') return 'admin-status-chip admin-status-chip--success';
  if (key === 'CANCELLED') return 'admin-status-chip admin-status-chip--danger';
  if (key === 'SHIPPING') return 'admin-status-chip admin-status-chip--info';
  if (key === 'CONFIRMED') return 'admin-status-chip admin-status-chip--primary';
  return 'admin-status-chip admin-status-chip--warning';
}

function getPaymentStatusClass(value) {
  const key = String(value || '').toUpperCase();
  if (key === 'PAID') return 'admin-status-chip admin-status-chip--success';
  if (key === 'FAILED') return 'admin-status-chip admin-status-chip--danger';
  if (key === 'REFUNDED') return 'admin-status-chip admin-status-chip--muted';
  return 'admin-status-chip admin-status-chip--warning';
}

function getStoredUserId() {
  try {
    const raw = localStorage.getItem('tn_laptop_user');
    const user = raw ? JSON.parse(raw) : null;
    return Number(user?.id || 0) || null;
  } catch {
    return null;
  }
}

function AdminOrderList() {
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    orderStatus: 'all',
    paymentStatus: 'all',
  });
  const [statusDraft, setStatusDraft] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);

        const response = await getAdminOrders({
          page: pagination.page,
          limit: pagination.limit,
          keyword: filters.keyword || undefined,
          order_status: filters.orderStatus === 'all' ? undefined : filters.orderStatus,
          payment_status: filters.paymentStatus === 'all' ? undefined : filters.paymentStatus,
        });

        const payload = response?.data;
        const items = payload?.items || [];
        const nextPagination = payload?.pagination || {};

        setOrders(items);
        setStatusDraft(
          items.reduce((acc, item) => {
            acc[item.id] = item.order_status;
            return acc;
          }, {})
        );
        setPagination((prev) => ({
          ...prev,
          total: Number(nextPagination.total || 0),
          totalPages: Math.max(1, Number(nextPagination.totalPages || 1)),
        }));
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách đơn hàng.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [filters, pagination.page, pagination.limit]);

  function applySearch(event) {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, keyword: keywordInput.trim() }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === pagination.page) {
      return;
    }

    setPagination((prev) => ({ ...prev, page: nextPage }));
  }

  async function handleUpdateStatus(order) {
    const nextStatus = String(statusDraft[order.id] || '').trim().toUpperCase();

    if (!nextStatus) {
      toast.error('Vui lòng chọn trạng thái hợp lệ.');
      return;
    }

    if (nextStatus === String(order.order_status || '').toUpperCase()) {
      toast('Trạng thái chưa thay đổi.', { icon: 'ℹ️' });
      return;
    }

    try {
      setSavingOrderId(order.id);
      await updateAdminOrderStatus(order.id, {
        order_status: nextStatus,
        changed_by: getStoredUserId(),
      });

      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, order_status: nextStatus } : item
        )
      );
      toast.success('Cập nhật trạng thái đơn hàng thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng.';
      toast.error(message);
    } finally {
      setSavingOrderId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý đơn hàng">
      <section className="admin-panel">
        <form className="admin-filter-row" onSubmit={applySearch}>
          <label className="admin-filter-row__keyword">
            <span>Từ khóa</span>
            <input
              type="text"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="Mã đơn / Người nhận / SĐT"
            />
          </label>

          <label>
            <span>Trạng thái đơn</span>
            <select
              value={filters.orderStatus}
              onChange={(event) => updateFilter('orderStatus', event.target.value)}
            >
              <option value="all">Tất cả</option>
              {ORDER_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Thanh toán</span>
            <select
              value={filters.paymentStatus}
              onChange={(event) => updateFilter('paymentStatus', event.target.value)}
            >
              <option value="all">Tất cả</option>
              {PAYMENT_STATUS_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>

          <button type="submit">Tìm kiếm</button>
        </form>

        {loading ? (
          <div className="admin-loading">Đang tải danh sách đơn hàng...</div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table admin-orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Người nhận</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật trạng thái</th>
                    <th>Ngày tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="admin-empty">Không có đơn hàng phù hợp.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.order_code}</td>
                        <td>
                          <p className="admin-order-name">{order.customer_name || '-'}</p>
                          <span className="admin-order-sub">{order.customer_email || '-'}</span>
                        </td>
                        <td>
                          <p className="admin-order-name">{order.recipient_name}</p>
                          <span className="admin-order-sub">{order.recipient_phone}</span>
                        </td>
                        <td>{Number(order.item_count || 0)}</td>
                        <td>{formatVnd(order.grand_total)}</td>
                        <td>
                          <span className={getPaymentStatusClass(order.payment_status)}>
                            {getPaymentStatusLabel(order.payment_status)}
                          </span>
                        </td>
                        <td>
                          <span className={getOrderStatusClass(order.order_status)}>
                            {getOrderStatusLabel(order.order_status)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-order-update-row">
                            <select
                              value={statusDraft[order.id] || ''}
                              onChange={(event) =>
                                setStatusDraft((prev) => ({
                                  ...prev,
                                  [order.id]: event.target.value,
                                }))
                              }
                              disabled={savingOrderId === order.id}
                            >
                              {ORDER_STATUS_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="admin-btn admin-btn--edit"
                              onClick={() => handleUpdateStatus(order)}
                              disabled={savingOrderId === order.id}
                            >
                              {savingOrderId === order.id ? 'Đang lưu...' : 'Lưu'}
                            </button>
                          </div>
                        </td>
                        <td>{formatDateTime(order.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <button type="button" onClick={() => goToPage(pagination.page - 1)} disabled={pagination.page <= 1}>
                Trang trước
              </button>
              <span>Trang {pagination.page}/{pagination.totalPages} • {pagination.total} đơn</span>
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Trang sau
              </button>
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminOrderList;
