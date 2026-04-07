import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function EmailVerifyResult() {
  const [searchParams] = useSearchParams();
  const status = String(searchParams.get('status') || 'error').toLowerCase();
  const message = searchParams.get('message') || '';

  const isSuccess = status === 'success';

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    try {
      const raw = localStorage.getItem('tn_laptop_user');
      if (!raw) {
        return;
      }

      const user = JSON.parse(raw);
      const nextUser = {
        ...user,
        email_verified: 1,
      };
      localStorage.setItem('tn_laptop_user', JSON.stringify(nextUser));
      window.dispatchEvent(new Event('tn-laptop-auth-change'));
    } catch {
      // Ignore localStorage sync errors.
    }
  }, [isSuccess]);

  return (
    <main className="verify-shell">
      <section className={`verify-card ${isSuccess ? 'is-success' : 'is-error'}`}>
        <h1>{isSuccess ? 'Xác Thực Email Thành Công!' : 'Xác thực email thất bại'}</h1>
        <p>
          {isSuccess
            ? 'Email của bạn đã được xác thực. Bạn có thể tiếp tục mua sắm và nhận đầy đủ thông báo từ hệ thống.'
            : message || 'Liên kết xác thực không hợp lệ hoặc đã hết hạn.'}
        </p>

        <div className="verify-actions">
          <Link to="/">Về trang chủ</Link>
          <Link to="/account/profile">Đến trang tài khoản</Link>
        </div>
      </section>
    </main>
  );
}

export default EmailVerifyResult;
