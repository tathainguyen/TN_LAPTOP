import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ProductCard from '../../components/ProductCard.jsx';
import { getAllProducts } from '../../services/productService.js';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await getAllProducts();
        const payload = response?.data;
        const normalizedProducts = Array.isArray(payload)
          ? payload
          : payload?.items || [];
        setProducts(normalizedProducts);
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể tải danh sách sản phẩm.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="home-page">
      <section className="home-banner">
        <div className="home-banner__content">
          <p className="home-kicker">TN Laptop Store</p>
          <h1>Hiệu năng đỉnh cao cho học tập, làm việc và gaming</h1>
          <p>
            Khám phá các mẫu laptop mới với cấu hình mạnh mẽ, giá tốt và bảo hành
            chính hãng.
          </p>
        </div>
      </section>

      <section className="home-products">
        <div className="section-head">
          <h2>Sản phẩm nổi bật</h2>
          <span>{products.length} sản phẩm</span>
        </div>

        {loading ? (
          <div className="home-loading">Đang tải dữ liệu sản phẩm...</div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Home;

