import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import './App.css';
import AdminBrandList from './pages/admin/AdminBrandList.jsx';
import AdminCategoryList from './pages/admin/AdminCategoryList.jsx';
import Header from './components/layout/Header.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProductCreate from './pages/admin/AdminProductCreate.jsx';
import AdminProductLinkCreate from './pages/admin/AdminProductLinkCreate.jsx';
import AdminProductLinkList from './pages/admin/AdminProductLinkList.jsx';
import AdminProductList from './pages/admin/AdminProductList.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import AdminUserCreate from './pages/admin/AdminUserCreate.jsx';
import AdminUserList from './pages/admin/AdminUserList.jsx';
import CustomerAccountLayout from './pages/customer/CustomerAccountLayout.jsx';
import CustomerAddresses from './pages/customer/CustomerAddresses.jsx';
import CustomerOrders from './pages/customer/CustomerOrders.jsx';
import CustomerPassword from './pages/customer/CustomerPassword.jsx';
import CustomerProfile from './pages/customer/CustomerProfile.jsx';
import CustomerVouchers from './pages/customer/CustomerVouchers.jsx';
import Home from './pages/store/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Product from './pages/store/Product.jsx';
import ProductDetail from './pages/store/ProductDetail.jsx';
import Register from './pages/auth/Register.jsx';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('tn_laptop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isAdminUser(user) {
  const roleName = String(user?.role_name || '').toUpperCase();
  return roleName === 'ADMIN' || Number(user?.role_id) === 1;
}

function App() {
  const location = useLocation();
  const [authUser, setAuthUser] = useState(() => getStoredUser());

  useEffect(() => {
    function syncAuthUser() {
      setAuthUser(getStoredUser());
    }

    window.addEventListener('storage', syncAuthUser);
    window.addEventListener('tn-laptop-auth-change', syncAuthUser);

    return () => {
      window.removeEventListener('storage', syncAuthUser);
      window.removeEventListener('tn-laptop-auth-change', syncAuthUser);
    };
  }, []);

  const isLoggedIn = Boolean(authUser?.id);
  const isAdmin = isAdminUser(authUser);
  const isAdminRoute = location.pathname.startsWith('/admin');

  function adminOnly(element) {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }

    return element;
  }

  function customerOnly(element) {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }

    return element;
  }

  function storefrontOnly(element) {
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }

    return element;
  }

  function guestOnly(element) {
    if (!isLoggedIn) {
      return element;
    }

    return <Navigate to={isAdmin ? '/admin' : '/'} replace />;
  }

  return (
    <>
      {!isAdminRoute && !isAdmin ? <Header /> : null}

      <main className="app-content">
        <Routes>
          <Route path="/" element={storefrontOnly(<Home />)} />
          <Route path="/admin" element={adminOnly(<AdminDashboard />)} />
          <Route path="/admin/brands" element={adminOnly(<AdminBrandList />)} />
          <Route path="/admin/brands/create" element={adminOnly(<Navigate to="/admin/brands" replace />)} />
          <Route path="/admin/categories" element={adminOnly(<AdminCategoryList />)} />
          <Route path="/admin/categories/create" element={adminOnly(<Navigate to="/admin/categories" replace />)} />
          <Route path="/admin/catalog-brand" element={adminOnly(<Navigate to="/admin/brands" replace />)} />
          <Route path="/admin/catalog-brand/create" element={adminOnly(<Navigate to="/admin/brands/create" replace />)} />
          <Route path="/admin/users" element={adminOnly(<AdminUserList />)} />
          <Route path="/admin/users/create" element={adminOnly(<AdminUserCreate />)} />
          <Route path="/admin/profile" element={adminOnly(<AdminProfile />)} />
          <Route path="/admin/products" element={adminOnly(<AdminProductList />)} />
          <Route path="/admin/products/create" element={adminOnly(<AdminProductCreate />)} />
          <Route path="/admin/product-links" element={adminOnly(<AdminProductLinkList />)} />
          <Route path="/admin/product-links/create" element={adminOnly(<AdminProductLinkCreate />)} />
          <Route path="/product" element={storefrontOnly(<Product />)} />
          <Route path="/product/:slug" element={storefrontOnly(<ProductDetail />)} />
          <Route path="/account" element={customerOnly(<CustomerAccountLayout />)}>
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="addresses" element={<CustomerAddresses />} />
            <Route path="password" element={<CustomerPassword />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="vouchers" element={<CustomerVouchers />} />
            <Route index element={<Navigate to="profile" replace />} />
          </Route>
          <Route path="/login" element={guestOnly(<Login />)} />
          <Route path="/register" element={guestOnly(<Register />)} />
          <Route path="*" element={<Navigate to={isAdmin ? '/admin' : '/'} replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
