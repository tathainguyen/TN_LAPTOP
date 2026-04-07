import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { changeUserPassword } from '../../services/user/userService.js';

function CustomerPassword() {
  const { user } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Vui lòng nhập đủ thông tin mật khẩu.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu chưa khớp.');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        current_password: form.currentPassword,
        new_password: form.newPassword,
        confirm_password: form.confirmPassword,
      };

      console.log('📤 Gửi request đổi mật khẩu');
      const response = await changeUserPassword(user.id, payload);
      console.log('📥 Response từ server:', response);

      if (response.status === 'success') {
        toast.success('Đổi mật khẩu thành công.');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (error) {
      console.error('❌ Lỗi đổi mật khẩu:', error);
      const errMsg = error.response?.data?.message || error.message || 'Không thể đổi mật khẩu.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
          />
        </label>

        <label>
          Mật khẩu mới
          <input
            type="password"
            value={form.newPassword}
            onChange={(event) => updateField('newPassword', event.target.value)}
            disabled={isLoading}
          />
        </label>

        <label>
          Xác nhận mật khẩu mới
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            disabled={isLoading}
          />
        </label>

        <div className="customer-form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CustomerPassword;

