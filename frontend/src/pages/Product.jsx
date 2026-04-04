import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import ProductCard from '../components/ProductCard.jsx';
import { getAllProducts } from '../services/productService.js';

const LIMIT = 12;

function Product() {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await getAllProducts({ page, limit: LIMIT });
        const payload = response?.data;

        if (Array.isArray(payload)) {
          const computedTotal = Math.max(1, Math.ceil(payload.length / LIMIT));
          const start = (page - 1) * LIMIT;
          const end = start + LIMIT;
          setProducts(payload.slice(start, end));
          setTotalPages(computedTotal);
          return;
        }

        const items = payload?.items || [];
        const computedTotal =
          payload?.pagination?.totalPages ||
          payload?.meta?.totalPages ||
          Math.max(1, Math.ceil(items.length / LIMIT));

        setProducts(items);
        setTotalPages(computedTotal);
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể tải danh sách sản phẩm.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [page]);

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
      return;
    }

    setPage(nextPage);
  }

  return (
    <main className="home-page">
      <section className="home-products">
        <div className="section-head">
          <h2>Sản phẩm</h2>
          <span>Trang {page}/{totalPages}</span>
        </div>

        {loading ? (
          <div className="home-loading">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 product-list-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="product-pagination">
              <button
                type="button"
                className="page-btn"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
              >
                Trang trước
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => goToPage(p)}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                className="page-btn"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
              >
                Trang sau
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Product;