import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getCustomerOrders } from '../../services/order/orderService.js';

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
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

function getOrderStatusLabel(status) {
  const key = String(status || '').toUpperCase();

  if (key === 'PENDING_CONFIRM') return 'Chờ xác nhận';
  if (key === 'CONFIRMED') return 'Đã xác nhận';
  if (key === 'SHIPPING') return 'Đang giao';
  if (key === 'SUCCESS') return 'Thành công';
  if (key === 'CANCELLED') return 'Đã hủy';
  return key || '-';
}

function CustomerOrders() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCustomerOrders(user.id);
        setOrders(response?.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách đơn mua.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user?.id]);

  return (
    <section className="customer-card">
      <h2>Đơn mua</h2>

      <div className="customer-order-table-wrap">
        <table className="customer-order-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày mua</th>
              <th>SL mặt hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="customer-empty-row">Đang tải đơn mua...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="customer-empty-row">Bạn chưa có đơn hàng nào.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_code}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{order.item_count || 0}</td>
                  <td>{formatVnd(order.grand_total)}</td>
                  <td>
                    <span className="customer-status-chip">{getOrderStatusLabel(order.order_status)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CustomerOrders;

