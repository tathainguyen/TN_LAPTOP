import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import './App.css';
import Header from './components/Header.jsx';
import AdminCatalogBrand from './pages/AdminCatalogBrand.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProductCreate from './pages/AdminProductCreate.jsx';
import AdminProductLinkCreate from './pages/AdminProductLinkCreate.jsx';
import AdminProductLinkList from './pages/AdminProductLinkList.jsx';
import AdminProductList from './pages/AdminProductList.jsx';
import AdminUserCreate from './pages/AdminUserCreate.jsx';
import AdminUserList from './pages/AdminUserList.jsx';
import CustomerAccountLayout from './pages/CustomerAccountLayout.jsx';
import CustomerAddresses from './pages/CustomerAddresses.jsx';
import CustomerOrders from './pages/CustomerOrders.jsx';
import CustomerPassword from './pages/CustomerPassword.jsx';
import CustomerProfile from './pages/CustomerProfile.jsx';
import CustomerVouchers from './pages/CustomerVouchers.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Product from './pages/Product.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Register from './pages/Register.jsx';

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
          <Route path="/admin/catalog-brand" element={<AdminCatalogBrand />} />
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
