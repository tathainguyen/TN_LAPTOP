import { Navigate, Route, Routes } from 'react-router-dom';

import './App.css';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Register from './pages/Register.jsx';
import Shop from './pages/Shop.jsx';

function App() {
  return (
    <>
      <Header />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
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
