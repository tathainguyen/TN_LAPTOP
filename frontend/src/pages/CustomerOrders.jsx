const mockOrders = [
  {
    id: 'DH240601',
    createdAt: '2026-04-01',
    total: 24990000,
    status: 'Đã giao',
  },
  {
    id: 'DH240588',
    createdAt: '2026-03-28',
    total: 18990000,
    status: 'Đang giao',
  },
  {
    id: 'DH240521',
    createdAt: '2026-03-18',
    total: 32990000,
    status: 'Đã hủy',
  },
];

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function CustomerOrders() {
  return (
    <section className="customer-card">
      <h2>Đơn mua</h2>

      <div className="customer-order-table-wrap">
        <table className="customer-order-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày mua</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.createdAt}</td>
                <td>{formatVnd(order.total)}</td>
                <td>
                  <span className="customer-status-chip">{order.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CustomerOrders;
