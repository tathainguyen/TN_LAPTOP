import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import './App.css';
import Header from './components/Header.jsx';
import AdminCatalogBrand from './pages/AdminCatalogBrand.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProductCreate from './pages/AdminProductCreate.jsx';
import AdminProductLinkCode from './pages/AdminProductLinkCode.jsx';
import AdminProductList from './pages/AdminProductList.jsx';
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
          <Route path="/admin/products" element={<AdminProductList />} />
          <Route path="/admin/products/create" element={<AdminProductCreate />} />
          <Route path="/admin/product-links" element={<AdminProductLinkCode />} />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
