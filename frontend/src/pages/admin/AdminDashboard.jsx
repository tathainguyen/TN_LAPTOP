import AdminLayout from '../../layouts/AdminLayout.jsx';

function AdminDashboard() {
  return (
    <AdminLayout title="Tổng quan hệ thống">
      <div className="admin-cards">
        <article className="admin-card">
          <p>Đơn hàng</p>
          <strong>0</strong>
        </article>
        <article className="admin-card">
          <p>Sản phẩm</p>
          <strong>0</strong>
        </article>
        <article className="admin-card">
          <p>Thành viên</p>
          <strong>0</strong>
        </article>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;

