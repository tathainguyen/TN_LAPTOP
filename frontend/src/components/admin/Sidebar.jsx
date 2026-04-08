import {
  BadgePercent,
  BarChart3,
  Boxes,
  ChevronDown,
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
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
      {
        label: 'Người dùng',
        icon: Users,
        children: [
          { label: 'Danh sách người dùng', to: '/admin/users' },
          { label: 'Thêm người dùng', to: '/admin/users/create' },
        ],
      },
      {
        label: 'Danh mục & Nhãn hàng',
        icon: FolderTree,
        children: [
          { label: 'Quản lý danh mục', to: '/admin/categories' },
          { label: 'Quản lý nhãn hàng', to: '/admin/brands' },
        ],
      },
      { label: 'Banner & Tin tức', icon: LayoutPanelTop },
      { label: 'Đánh giá & Bình luận', icon: MessageSquare },
    ],
  },
  {
    title: 'Quản lý Kho & Sản phẩm',
    items: [
      { label: 'Nhập hàng', icon: PackagePlus },
      {
        label: 'Quản lý Sản phẩm',
        icon: Boxes,
        children: [
          { label: 'Danh sách sản phẩm', to: '/admin/products' },
          { label: 'Thêm sản phẩm mới', to: '/admin/products/create' },
        ],
      },
      {
        label: 'Quản lý Mã liên kết',
        icon: Receipt,
        children: [
          { label: 'Danh sách mã liên kết', to: '/admin/product-links' },
          { label: 'Tạo mã liên kết', to: '/admin/product-links/create' },
        ],
      },
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
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState({});

  useEffect(() => {
    if (location.pathname.startsWith('/admin/users')) {
      setOpenKeys((prev) => ({ ...prev, user: true }));
    }

    if (
      location.pathname.startsWith('/admin/categories') ||
      location.pathname.startsWith('/admin/brands') ||
      location.pathname.startsWith('/admin/catalog-brand')
    ) {
      setOpenKeys((prev) => ({ ...prev, catalog: true }));
    }

    if (location.pathname.startsWith('/admin/product-links')) {
      setOpenKeys((prev) => ({ ...prev, productLink: true }));
    }

    if (location.pathname.startsWith('/admin/products')) {
      setOpenKeys((prev) => ({ ...prev, product: true }));
    }
  }, [location.pathname]);

  function toggleGroup(key) {
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }

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

                if (item.children?.length) {
                  const subMenuKey =
                    item.label === 'Người dùng'
                      ? 'user'
                      : item.label === 'Danh mục & Nhãn hàng'
                        ? 'catalog'
                      : item.label === 'Quản lý Sản phẩm'
                        ? 'product'
                      : item.label === 'Quản lý Mã liên kết'
                        ? 'productLink'
                        : item.label;
                  const isOpen = Boolean(openKeys[subMenuKey]);
                  const isParentActive = item.children.some((child) =>
                    location.pathname.startsWith(child.to)
                  );

                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        className={`admin-menu-item admin-menu-item--parent ${isParentActive ? 'is-active' : ''}`}
                        onClick={() => toggleGroup(subMenuKey)}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                        <ChevronDown
                          size={15}
                          className={`admin-menu-item__chevron ${isOpen ? 'is-open' : ''}`}
                        />
                      </button>

                      {isOpen ? (
                        <ul className="admin-submenu">
                          {item.children.map((child) => (
                            <li key={child.label}>
                              <NavLink
                                to={child.to}
                                end
                                className={({ isActive }) =>
                                  `admin-submenu-item ${isActive ? 'is-active' : ''}`
                                }
                              >
                                {child.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        end
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
