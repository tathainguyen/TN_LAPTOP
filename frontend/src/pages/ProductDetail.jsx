import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getAllProducts, getProductBySlug } from '../services/productService.js';

const FALLBACK_IMAGE = 'https://via.placeholder.com/1200x750?text=No+Image';
const DETAIL_LOAD_GUARD_MS = 750;
const recentDetailLoads = new Map();

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [groupProducts, setGroupProducts] = useState([]);

  useEffect(() => {
    async function loadData() {
      const now = Date.now();
      const lastLoadAt = recentDetailLoads.get(slug) || 0;

      if (now - lastLoadAt < DETAIL_LOAD_GUARD_MS) {
        return;
      }

      recentDetailLoads.set(slug, now);

      try {
        setLoading(true);

        const [productResponse, allProductsResponse] = await Promise.all([
          getProductBySlug(slug),
          getAllProducts(),
        ]);

        const selectedProduct = productResponse?.data || null;

        if (!selectedProduct) {
          toast.error('Không tìm thấy sản phẩm.');
          navigate('/', { replace: true });
          return;
        }

        setProduct(selectedProduct);

        const allProductsPayload = allProductsResponse?.data;
        const allProducts = Array.isArray(allProductsPayload)
          ? allProductsPayload
          : allProductsPayload?.items || [];
        const sameGroup = allProducts.filter(
          (item) => Number(item.group_id) === Number(selectedProduct.group_id)
        );
        setGroupProducts(sameGroup);
        setActiveImageIndex(0);
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể tải chi tiết sản phẩm.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, navigate]);

  const imageSlides = useMemo(() => {
    if (!product) {
      return [FALLBACK_IMAGE];
    }

    const imageList = (product.images || [])
      .map((item) => String(item?.image_url || '').trim())
      .filter(Boolean);

    if (imageList.length > 0) {
      return imageList;
    }

    const primary = String(product.primary_image || '').trim();
    return primary ? [primary] : [FALLBACK_IMAGE];
  }, [product]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [slug, imageSlides.length]);

  const safeIndex = activeImageIndex >= imageSlides.length ? 0 : activeImageIndex;
  const currentImage = imageSlides[safeIndex] || FALLBACK_IMAGE;

  if (loading) {
    return (
      <main className="detail-page">
        <div className="detail-loading">Đang tải chi tiết sản phẩm...</div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="detail-page">
        <div className="detail-loading">Không có dữ liệu sản phẩm.</div>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <section className="detail-shell">
        <div className="detail-gallery">
          <img src={currentImage} alt={product.product_name} className="detail-main-image" />

          <div className="detail-thumbs">
            {imageSlides.map((img, idx) => (
              <button
                key={`${img}-${idx + 1}`}
                type="button"
                className={`detail-thumb ${safeIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(idx)}
              >
                <img src={img} alt={`Ảnh ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-info">
          <p className="detail-kicker">{product.brand_name} | {product.group_name}</p>
          <h1>{product.product_name}</h1>
          <p className="detail-views">Lượt xem: {Number(product.view_count || 0).toLocaleString('vi-VN')}</p>

          <div className="detail-price-wrap">
            <p className="detail-price">{formatVnd(product.price_sale)}</p>
            {Number(product.price_compare || 0) > Number(product.price_sale || 0) ? (
              <p className="detail-price-compare">{formatVnd(product.price_compare)}</p>
            ) : null}
          </div>

          <div className="detail-spec-grid">
            <div><span>CPU</span><strong>{product.cpu_option || 'Đang cập nhật'}</strong></div>
            <div><span>RAM</span><strong>{product.ram_option || 'Đang cập nhật'}</strong></div>
            <div><span>VGA</span><strong>{product.vga_option || 'Đang cập nhật'}</strong></div>
            <div><span>Lưu trữ</span><strong>{product.storage_option || 'Đang cập nhật'}</strong></div>
          </div>

          <section className="config-box">
            <h2>Lựa chọn cấu hình khác</h2>
            <div className="config-list">
              {groupProducts.map((item) => {
                const active = item.slug === product.slug;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`config-item ${active ? 'active' : ''}`}
                    onClick={() => {
                      if (!active) {
                        navigate(`/product/${item.slug}`);
                      }
                    }}
                  >
                    <strong>{item.product_name}</strong>
                    <span>{item.cpu_option} | {item.ram_option} | {item.vga_option}</span>
                    <em>{formatVnd(item.price_sale)}</em>
                  </button>
                );
              })}
            </div>
          </section>

          <button type="button" className="detail-add-cart">
            Thêm vào giỏ hàng
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProductDetail;
