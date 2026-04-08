import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { resetPassword } from '../../services/auth/authService.js';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!token) {
      toast.error('Thiếu token đặt lại mật khẩu. Vui lòng mở lại link từ email.');
      return;
    }

    if (!form.newPassword || !form.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu mới.');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu chưa khớp.');
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword({
        token,
        new_password: form.newPassword,
        confirm_password: form.confirmPassword,
      });

      toast.success(response?.message || 'Đặt lại mật khẩu thành công.');
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <aside className="auth-side">
          <div>
            <span className="auth-badge">TN Laptop</span>
            <h1>Đặt lại mật khẩu</h1>
            <p>
              Nhập mật khẩu mới cho tài khoản của bạn. Liên kết đặt lại chỉ có hiệu
              lực trong thời gian ngắn để đảm bảo an toàn.
            </p>
          </div>
        </aside>

        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Tạo mật khẩu mới</h2>
            <p className="subtitle">Không cần nhập mật khẩu cũ ở bước này.</p>

            <div className="field">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <input
                id="newPassword"
                type="password"
                value={form.newPassword}
                onChange={(event) => updateField('newPassword', event.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
              <input
                id="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading || !token}>
              {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
            </button>

            {!token ? (
              <p className="switch-text">
                Liên kết không hợp lệ. <Link to="/forgot-password">Yêu cầu link mới</Link>
              </p>
            ) : (
              <p className="switch-text">
                <Link to="/login">Quay lại đăng nhập</Link>
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}

export default ResetPassword;
