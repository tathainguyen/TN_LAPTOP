import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldUser } from 'lucide-react';

import Sidebar from '../components/admin/Sidebar.jsx';

function AdminLayout({ children, title = 'Dashboard quản trị' }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    function syncUserName() {
      try {
        const raw = localStorage.getItem('tn_laptop_user');
        const user = raw ? JSON.parse(raw) : null;
        const displayName =
          user?.full_name?.trim() ||
          user?.fullName?.trim() ||
          user?.email?.trim() ||
          'Admin';
        setUserName(displayName);
      } catch {
        setUserName('Admin');
      }
    }

    syncUserName();
    window.addEventListener('storage', syncUserName);
    window.addEventListener('tn-laptop-auth-change', syncUserName);

    return () => {
      window.removeEventListener('storage', syncUserName);
      window.removeEventListener('tn-laptop-auth-change', syncUserName);
    };
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-main">
        <header className="admin-header">
          <h1>{title}</h1>

          <div className="admin-header__actions">
            <label className="admin-search" htmlFor="admin-global-search">
              <Search size={16} />
              <input
                id="admin-global-search"
                type="search"
                placeholder="Tìm kiếm toàn cục..."
              />
            </label>

            <button type="button" className="admin-avatar" onClick={() => navigate('/admin/profile')}>
              <ShieldUser size={17} />
              <span>{userName}</span>
            </button>
          </div>
        </header>

        <section className="admin-content">{children}</section>
      </div>
    </div>
  );
}

export default AdminLayout;
