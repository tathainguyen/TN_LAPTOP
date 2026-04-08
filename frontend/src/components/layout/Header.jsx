import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getCartCountForHeader } from '../../services/cart/cartService.js';

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 7H7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1.3" fill="currentColor" />
      <circle cx="18" cy="20" r="1.3" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 19a7 7 0 0 1 14 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('tn_laptop_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function loadCartCount() {
      const nextCount = await getCartCountForHeader(user);
      setCartCount(nextCount);
    }

    loadCartCount();

    window.addEventListener('tn-laptop-cart-change', loadCartCount);
    window.addEventListener('storage', loadCartCount);
    window.addEventListener('tn-laptop-auth-change', loadCartCount);

    return () => {
      window.removeEventListener('tn-laptop-cart-change', loadCartCount);
      window.removeEventListener('storage', loadCartCount);
      window.removeEventListener('tn-laptop-auth-change', loadCartCount);
    };
  }, [user]);

  useEffect(() => {
    function syncAuthState() {
      try {
        const storedUser = localStorage.getItem('tn_laptop_user');
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch {
        setUser(null);
      }
    }

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('tn-laptop-auth-change', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('tn-laptop-auth-change', syncAuthState);
    };
  }, []);

  const displayName =
    user?.full_name?.trim() || user?.fullName?.trim() || user?.email?.trim() || 'ĐĂNG NHẬP';

  function handleLogout() {
    localStorage.removeItem('tn_laptop_token');
    localStorage.removeItem('tn_laptop_user');
    window.dispatchEvent(new Event('tn-laptop-auth-change'));
    navigate('/', { replace: true });
  }

  return (
    <>
      <header>
        <div className="topbar bg-gray-100 text-sm">
          <div className="header-inner topbar-inner">
            <div className="topbar-left">
              <span>Điện thoại: 0123.456.789</span>
              <span>Email: support@tnlaptop.com</span>
            </div>

            <div className="topbar-right">
              <Link to={user ? '/account/profile' : '/login'} className={user ? 'topbar-user-link' : ''}>
                {displayName}
              </Link>
              <span className="topbar-divider">|</span>
              {user ? (
                <button type="button" onClick={handleLogout}>
                  ĐĂNG XUẤT
                </button>
              ) : (
                <Link to="/register">ĐĂNG KÝ</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="navbar shadow-md">
        <div className="header-inner navbar-inner">
          <Link to="/" className="brand-logo">
            TN_LAPTOP
          </Link>

          <nav className="main-menu" aria-label="Điều hướng chính">
            <Link to="/">TRANG CHỦ</Link>
            <Link to="/product">SẢN PHẨM</Link>
            <a href="#">TIN TỨC</a>
            <a href="#">GIỚI THIỆU</a>
          </nav>

          <div className="navbar-icons">
            <button
              type="button"
              className="icon-btn"
              aria-label="Giỏ hàng"
              onClick={() => navigate('/cart')}
            >
              <CartIcon />
              <span className="cart-badge">{cartCount}</span>
            </button>

            <Link to={user ? '/account/profile' : '/login'} className="icon-btn" aria-label="Tài khoản">
              <UserIcon />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
