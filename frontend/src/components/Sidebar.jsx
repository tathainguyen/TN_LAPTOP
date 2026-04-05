import {
  BadgePercent,
  BarChart3,
  Boxes,
  ClipboardList,
  FolderTree,
  Gauge,
  LayoutPanelTop,
  MessageSquare,
  Newspaper,
  PackagePlus,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const menuGroups = [
  {
    title: 'Tổng quan',
    items: [
      { label: 'Dashboard', icon: Gauge, to: '/admin' },
    ],
  },
  {
    title: 'Quản lý Hệ thống & User',
    items: [
      { label: 'Danh sách người dùng', icon: Users, to: '/admin/users' },
      { label: 'Thêm người dùng', icon: Users, to: '/admin/users/create' },
      { label: 'Danh mục & Nhãn hàng', icon: FolderTree, to: '/admin/catalog-brand' },
      { label: 'Banner & Tin tức', icon: LayoutPanelTop },
      { label: 'Đánh giá & Bình luận', icon: MessageSquare },
    ],
  },
  {
    title: 'Quản lý Kho & Sản phẩm',
    items: [
      { label: 'Nhập hàng', icon: PackagePlus },
      { label: 'Quản lý Sản phẩm', icon: Boxes, to: '/admin/products' },
      { label: 'Quản lý Mã liên kết', icon: Receipt, to: '/admin/product-links' },
      { label: 'Nhà cung cấp', icon: ShieldCheck },
    ],
  },
  {
    title: 'Quản lý Kinh doanh & Vận hành',
    items: [
      { label: 'Voucher', icon: BadgePercent },
      { label: 'Vận chuyển', icon: Truck },
      { label: 'Đơn hàng', icon: ShoppingCart },
      { label: 'Tin nhắn', icon: Newspaper },
      { label: 'Báo cáo', icon: BarChart3 },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <ClipboardList size={18} />
        <strong>TRANG QUẢN TRỊ</strong>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {menuGroups.map((group) => (
          <section className="admin-menu-group" key={group.title}>
            <p className="admin-menu-group__title">{group.title}</p>

            <ul>
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `admin-menu-item ${isActive ? 'is-active' : ''}`
                        }
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </NavLink>
                    ) : (
                      <button type="button" className="admin-menu-item">
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
