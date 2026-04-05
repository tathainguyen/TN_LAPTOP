import { useState } from 'react';
import toast from 'react-hot-toast';

function CustomerPassword() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Vui lòng nhập đủ thông tin mật khẩu.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu chưa khớp.');
      return;
    }

    toast.success('Demo giao diện: Đổi mật khẩu thành công (chức năng thật sẽ làm sau).');
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  return (
    <section className="customer-card">
      <h2>Đổi mật khẩu</h2>

      <form className="customer-password-form" onSubmit={handleSubmit}>
        <label>
          Mật khẩu hiện tại
          <input
            type="password"
            value={form.currentPassword}
            onChange={(event) => updateField('currentPassword', event.target.value)}
          />
        </label>

        <label>
          Mật khẩu mới
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) => updateField('newPassword', event.target.value)}
          />
        </label>

        <label>
          Xác nhận mật khẩu mới
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
          />
        </label>

        <div className="customer-form-actions">
          <button type="submit">Cập nhật mật khẩu</button>
        </div>
      </form>
    </section>
  );
}

export default CustomerPassword;
