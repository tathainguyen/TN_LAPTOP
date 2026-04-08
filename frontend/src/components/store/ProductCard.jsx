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

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ProductCard({ product }) {
  const basePrice = toNumber(product.price_sale);
  const discountPrice = toNumber(product.price_compare);
  const hasDiscount = discountPrice > 0 && basePrice > 0 && discountPrice < basePrice;
  const displayPrice = hasDiscount ? discountPrice : basePrice;

  return (
    <article className="product-card group overflow-hidden">
      <div className="product-thumb-wrap">
        <img
          className="product-thumb transition-transform duration-300 group-hover:scale-105"
          src={FALLBACK_IMAGE}
          alt={product.product_name}
          loading="lazy"
        />
      </div>

      <div className="product-content">
        <h3 className="product-title transition-colors duration-300 group-hover:text-blue-500">
          {product.product_name}
        </h3>

        <div className="product-price-wrap">
          <p className="product-price">{formatVnd(displayPrice)}</p>
          {hasDiscount ? (
            <p className="product-price-original">{formatVnd(basePrice)}</p>
          ) : null}
        </div>

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
