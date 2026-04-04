import { Search, ShieldUser } from 'lucide-react';

import Sidebar from '../components/Sidebar.jsx';

function AdminLayout({ children, title = 'Dashboard quản trị' }) {
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

            <button type="button" className="admin-avatar">
              <ShieldUser size={17} />
              <span>Admin</span>
            </button>
          </div>
        </header>

        <section className="admin-content">{children}</section>
      </div>
    </div>
  );
}

export default AdminLayout;
