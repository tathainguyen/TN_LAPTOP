import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import './App.css';
import AdminBrandList from './pages/admin/AdminBrandList.jsx';
import AdminCategoryList from './pages/admin/AdminCategoryList.jsx';
import Header from './components/Header.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProductCreate from './pages/admin/AdminProductCreate.jsx';
import AdminProductLinkCreate from './pages/admin/AdminProductLinkCreate.jsx';
import AdminProductLinkList from './pages/admin/AdminProductLinkList.jsx';
import AdminProductList from './pages/admin/AdminProductList.jsx';
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

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute ? <Header /> : null}

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/brands" element={<AdminBrandList />} />
          <Route path="/admin/brands/create" element={<Navigate to="/admin/brands" replace />} />
          <Route path="/admin/categories" element={<AdminCategoryList />} />
          <Route path="/admin/categories/create" element={<Navigate to="/admin/categories" replace />} />
          <Route path="/admin/catalog-brand" element={<Navigate to="/admin/brands" replace />} />
          <Route path="/admin/catalog-brand/create" element={<Navigate to="/admin/brands/create" replace />} />
          <Route path="/admin/users" element={<AdminUserList />} />
          <Route path="/admin/users/create" element={<AdminUserCreate />} />
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/products/create" element={<AdminProductCreate />} />
          <Route path="/admin/product-links" element={<AdminProductLinkList />} />
          <Route path="/admin/product-links/create" element={<AdminProductLinkCreate />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/account" element={<CustomerAccountLayout />}>
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="addresses" element={<CustomerAddresses />} />
            <Route path="password" element={<CustomerPassword />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="vouchers" element={<CustomerVouchers />} />
            <Route index element={<Navigate to="profile" replace />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
