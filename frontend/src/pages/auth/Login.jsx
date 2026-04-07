import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { loginUser } from '../../services/authService.js';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await loginUser(formData);
      const token = response?.data?.token;
      const user = response?.data?.user || null;

      if (!token) {
        toast.error('Không nhận được token từ máy chủ.');
        return;
      }

      localStorage.setItem('tn_laptop_token', token);
      if (user) {
        localStorage.setItem('tn_laptop_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('tn_laptop_user');
      }

      window.dispatchEvent(new Event('tn-laptop-auth-change'));
      toast.success('Đăng nhập thành công.');
      navigate('/', { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
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
            <h1>Đăng nhập hệ thống bán laptop chuyên nghiệp</h1>
            <p>
              Kiểm soát tài khoản, theo dõi đơn hàng và nhận các ưu đãi công nghệ mới
              nhất theo thời gian thực.
            </p>
          </div>

          <ul className="auth-highlights">
            <li>Đồng bộ giỏ hàng giữa các thiết bị.</li>
            <li>Quản lý đơn mua và trạng thái vận chuyển nhanh gọn.</li>
            <li>Ưu đãi voucher riêng cho thành viên đăng nhập.</li>
          </ul>
        </aside>

        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Chào mừng trở lại</h2>
            <p className="subtitle">Nhập thông tin để tiếp tục mua sắm.</p>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ban@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <p className="switch-text">
              Chưa có tài khoản? <Link to="/register">Tạo tài khoản mới</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Login;

