import { Link } from 'react-router-dom';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80';

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-thumb-wrap">
        <img className="product-thumb" src={FALLBACK_IMAGE} alt={product.product_name} />
      </div>

      <div className="product-content">
        <h3 className="product-title">{product.product_name}</h3>
        <p className="product-price">{formatVnd(product.price_sale)}</p>

        <div className="product-badges">
          {product.cpu_option ? <span className="badge">CPU: {product.cpu_option}</span> : null}
          {product.ram_option ? <span className="badge">RAM: {product.ram_option}</span> : null}
          {product.vga_option ? <span className="badge">VGA: {product.vga_option}</span> : null}
        </div>

        <Link className="product-link" to={`/product/${product.slug}`}>
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}

export default ProductCard;
