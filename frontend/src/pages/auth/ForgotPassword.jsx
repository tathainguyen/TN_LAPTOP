import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { requestPasswordReset } from '../../services/auth/authService.js';

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedEmail = String(email || '').trim();
    if (!normalizedEmail) {
      toast.error('Vui lòng nhập email.');
      return;
    }

    try {
      setLoading(true);
      const response = await requestPasswordReset({ email: normalizedEmail });
      toast.success(
        response?.message ||
          'Nếu email hợp lệ, chúng tôi đã gửi link hướng dẫn đặt lại mật khẩu.'
      );
      setEmail('');
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Không thể xử lý yêu cầu quên mật khẩu lúc này. Vui lòng thử lại.';
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
            <h1>Khôi phục mật khẩu tài khoản</h1>
            <p>
              Nhập email bạn đã đăng ký. Nếu hợp lệ, hệ thống sẽ gửi đường dẫn đổi
              mật khẩu có hiệu lực trong 15 phút.
            </p>
          </div>
        </aside>

        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Quên mật khẩu</h2>
            <p className="subtitle">Nhập email để nhận liên kết đặt lại mật khẩu.</p>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ban@email.com"
                autoComplete="email"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
            </button>

            <p className="switch-text">
              <Link to="/login">Quay lại đăng nhập</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
