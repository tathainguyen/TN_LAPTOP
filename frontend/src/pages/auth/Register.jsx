import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { registerUser } from '../../services/auth/authService.js';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (response?.status === 'success') {
        toast.success('Đăng ký thành công. Hãy đăng nhập để tiếp tục.');
        navigate('/login', { replace: true });
        return;
      }

      toast.error(response?.message || 'Đăng ký thất bại.');
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
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
            <h1>Tạo tài khoản để bắt đầu hành trình công nghệ</h1>
            <p>
              Đăng ký nhanh chỉ trong ít giây để sẵn sàng mua sắm laptop, theo dõi ưu
              đãi và quản lý đơn hàng cá nhân.
            </p>
          </div>

          <ul className="auth-highlights">
            <li>Đăng ký và xác thực tài khoản để nhận ưu đãi đặc biệt.</li>
            <li>Đồng bộ thông tin địa chỉ và lịch sử đơn mua tự động.</li>
            <li>Trải nghiệm thanh toán COD hoặc online linh hoạt.</li>
          </ul>
        </aside>

        <div className="auth-form-wrap">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Tạo tài khoản</h2>
            <p className="subtitle">Hoàn tất thông tin để đăng ký thành viên mới.</p>

            <div className="field">
              <label htmlFor="full_name">Họ và tên</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                required
              />
            </div>

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
              <label htmlFor="phone">Số điện thoại</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912 345 678"
                autoComplete="tel"
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
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>

            <p className="switch-text">
              Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Register;

