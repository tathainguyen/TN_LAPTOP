import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sendVerificationEmail } from '../../services/auth/authService.js';

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem('tn_laptop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getInitials(fullName, email) {
  const text = String(fullName || email || '').trim();
  if (!text) {
    return 'U';
  }

  const chunks = text.split(/\s+/).filter(Boolean);
  if (chunks.length === 1) {
    return chunks[0].slice(0, 1).toUpperCase();
  }

  return `${chunks[0][0] || ''}${chunks[chunks.length - 1][0] || ''}`.toUpperCase();
}

function CustomerAccountLayout() {
  const [user, setUser] = useState(() => getUserFromStorage());
  const [sendingVerifyEmail, setSendingVerifyEmail] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      setUser(getUserFromStorage());
    }

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('tn-laptop-auth-change', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('tn-laptop-auth-change', syncAuthState);
    };
  }, []);

  const profile = useMemo(() => {
    const fullName = user?.full_name || user?.fullName || 'Khách hàng';
    const email = user?.email || 'email@example.com';
    const avatarUrl = user?.avatar_url || user?.avatarUrl || '';
    const emailVerified = Number(user?.email_verified || 0) === 1;

    return {
      fullName,
      email,
      avatarUrl,
      emailVerified,
      initials: getInitials(fullName, email),
    };
  }, [user]);

  async function handleSendVerificationMail() {
    if (!user?.id || !user?.email) {
      toast.error('Không tìm thấy thông tin tài khoản để gửi xác thực email.');
      return;
    }

    try {
      setSendingVerifyEmail(true);
      await sendVerificationEmail({
        user_id: user.id,
        email: user.email,
      });
      toast.success('Đã gửi email xác thực. Vui lòng kiểm tra hộp thư của bạn.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể gửi email xác thực lúc này.';
      toast.error(message);
    } finally {
      setSendingVerifyEmail(false);
    }
  }

  return (
    <main className="customer-account-shell">
      <section className="customer-account-layout">
        <aside className="customer-account-left">
          <div className="customer-avatar-wrap">
            {profile.avatarUrl ? (
              <img className="customer-avatar" src={profile.avatarUrl} alt={profile.fullName} />
            ) : (
              <div className="customer-avatar customer-avatar--fallback" aria-hidden="true">
                {profile.initials}
              </div>
            )}
          </div>

          <h3>{profile.fullName}</h3>

          <p className="customer-email">
            <span>{profile.email}</span>
            <span
              className={`customer-email-verify-dot ${profile.emailVerified ? 'is-verified' : 'is-unverified'}`}
              title={profile.emailVerified ? 'Email đã xác thực' : 'Email chưa xác thực'}
            >
              {profile.emailVerified ? '✓' : '✕'}
            </span>
          </p>

          <button
            type="button"
            className="customer-verify-btn"
            disabled={profile.emailVerified || sendingVerifyEmail}
            onClick={handleSendVerificationMail}
          >
            {profile.emailVerified
              ? 'Đã xác thực'
              : sendingVerifyEmail
                ? 'Đang gửi email...'
                : 'Xác thực email'}
          </button>
        </aside>

        <section className="customer-account-center">
          <Outlet context={{ user, setUser }} />
        </section>

        <aside className="customer-account-right">
          <h3>Danh mục</h3>

          <div className="customer-menu-group">
            <p>Tài khoản của tôi</p>
            <NavLink to="/account/profile" end>
              Hồ sơ
            </NavLink>
            <NavLink to="/account/addresses" end>
              Địa chỉ
            </NavLink>
            <NavLink to="/account/password" end>
              Đổi mật khẩu
            </NavLink>
          </div>

          <div className="customer-menu-group">
            <NavLink to="/account/orders" end>
              Đơn mua
            </NavLink>
            <NavLink to="/account/vouchers" end>
              Kho voucher
            </NavLink>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default CustomerAccountLayout;

