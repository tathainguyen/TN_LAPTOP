import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import { createAdminUser, getUserMasterData } from '../../services/userService.js';

const initialForm = {
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role_id: '',
  phone: '',
  gender: '',
  date_of_birth: '',
  avatar_url: '',
  email_verified: 0,
  user_status: 'ACTIVE',
};

function AdminUserCreate() {
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoadingRoles(true);
        const response = await getUserMasterData();
        setRoles(response?.data?.roles || []);
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách vai trò.';
        toast.error(message);
      } finally {
        setLoadingRoles(false);
      }
    }

    loadRoles();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.full_name.trim() || !form.email.trim() || !form.password || !form.role_id) {
      toast.error('Vui lòng nhập đủ Họ tên, Email, Mật khẩu và Vai trò.');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setSaving(true);
      await createAdminUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role_id: Number(form.role_id),
        phone: form.phone.trim(),
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        avatar_url: form.avatar_url.trim() || null,
        email_verified: Number(form.email_verified) ? 1 : 0,
        user_status: form.user_status,
      });

      toast.success('Tạo tài khoản người dùng thành công.');
      resetForm();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo người dùng.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout title="Thêm người dùng">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Tạo tài khoản mới</h2>
            <p>Nhập đầy đủ thông tin để tạo người dùng như dữ liệu tài khoản ban đầu.</p>
          </div>
        </div>

        {loadingRoles ? (
          <div className="admin-loading">Đang tải dữ liệu vai trò...</div>
        ) : (
          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Họ và tên
              <input
                type="text"
                value={form.full_name}
                onChange={(event) => updateField('full_name', event.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>

            <label>
              Mật khẩu
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                minLength={6}
                required
              />
            </label>

            <label>
              Xác nhận mật khẩu
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                minLength={6}
                required
              />
            </label>

            <label>
              Vai trò
              <select
                value={form.role_id}
                onChange={(event) => updateField('role_id', event.target.value)}
                required
              >
                <option value="">-- Chọn vai trò --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Số điện thoại
              <input
                type="text"
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                placeholder="0912 345 678"
              />
            </label>

            <label>
              Giới tính
              <select
                value={form.gender}
                onChange={(event) => updateField('gender', event.target.value)}
              >
                <option value="">-- Không chọn --</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </label>

            <label>
              Ngày sinh
              <input
                type="date"
                value={form.date_of_birth}
                onChange={(event) => updateField('date_of_birth', event.target.value)}
              />
            </label>

            <label>
              Trạng thái email
              <select
                value={form.email_verified}
                onChange={(event) => updateField('email_verified', Number(event.target.value))}
              >
                <option value={0}>Chưa xác thực</option>
                <option value={1}>Đã xác thực</option>
              </select>
            </label>

            <label>
              Trạng thái tài khoản
              <select
                value={form.user_status}
                onChange={(event) => updateField('user_status', event.target.value)}
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="BLOCKED">Đã khóa</option>
              </select>
            </label>

            <label className="admin-form-grid__full">
              Avatar URL
              <input
                type="text"
                value={form.avatar_url}
                onChange={(event) => updateField('avatar_url', event.target.value)}
                placeholder="https://..."
              />
            </label>

            <div className="admin-form-actions admin-form-grid__full">
              <button type="button" onClick={resetForm} disabled={saving}>
                Đặt lại
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang tạo...' : 'Tạo người dùng'}
              </button>
            </div>
          </form>
        )}
      </section>
    </AdminLayout>
  );
}

export default AdminUserCreate;

