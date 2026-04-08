import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getUserCart,
  removeUserCartItem,
  updateUserCartItem,
} from '../../services/cart/cartService.js';
import {
  getGuestCartItems,
  saveGuestCartItems,
} from '../../services/cart/cartStorage.js';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x380?text=No+Image';

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('tn_laptop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Cart() {
  const [loading, setLoading] = useState(true);
  const [submittingProductId, setSubmittingProductId] = useState(null);
  const [user, setUser] = useState(() => getStoredUser());
  const [items, setItems] = useState([]);

  useEffect(() => {
    function syncUser() {
      setUser(getStoredUser());
    }

    window.addEventListener('storage', syncUser);
    window.addEventListener('tn-laptop-auth-change', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('tn-laptop-auth-change', syncUser);
    };
  }, []);

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);

        if (user?.id) {
          const response = await getUserCart(user.id);
          setItems(response?.data?.items || []);
          return;
        }

        setItems(getGuestCartItems());
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải giỏ hàng.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [user?.id]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0),
    [items]
  );

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items]
  );

  async function updateQuantity(item, nextQuantity) {
    const productId = Number(item.product_id || item.id);

    if (nextQuantity < 1) {
      return;
    }

    try {
      setSubmittingProductId(productId);

      if (user?.id) {
        const response = await updateUserCartItem({
          userId: user.id,
          productId,
          quantity: nextQuantity,
        });
        setItems(response?.data?.items || []);
      } else {
        const nextItems = getGuestCartItems().map((cartItem) =>
          Number(cartItem.product_id) === productId
            ? { ...cartItem, quantity: nextQuantity }
            : cartItem
        );
        saveGuestCartItems(nextItems);
        setItems(nextItems);
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật số lượng.';
      toast.error(message);
    } finally {
      setSubmittingProductId(null);
    }
  }

  async function removeItem(item) {
    const productId = Number(item.product_id || item.id);

    try {
      setSubmittingProductId(productId);

      if (user?.id) {
        const response = await removeUserCartItem({
          userId: user.id,
          productId,
        });
        setItems(response?.data?.items || []);
      } else {
        const nextItems = getGuestCartItems().filter(
          (cartItem) => Number(cartItem.product_id) !== productId
        );
        saveGuestCartItems(nextItems);
        setItems(nextItems);
      }

      toast.success('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng.';
      toast.error(message);
    } finally {
      setSubmittingProductId(null);
    }
  }

  return (
    <main className="cart-page">
      <section className="cart-shell">
        <header className="cart-head">
          <h1>Giỏ hàng của bạn</h1>
          <p>{totalQuantity} sản phẩm</p>
        </header>

        {loading ? (
          <div className="cart-empty">Đang tải giỏ hàng...</div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <p>Giỏ hàng đang trống.</p>
            <Link to="/product" className="cart-go-shopping">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-list">
              {items.map((item) => {
                const productId = Number(item.product_id || item.id);
                const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
                return (
                  <article className="cart-item" key={`${productId}-${item.sku || ''}`}>
                    <img src={item.primary_image || FALLBACK_IMAGE} alt={item.product_name} />

                    <div className="cart-item__body">
                      <h3>{item.product_name || 'Sản phẩm'}</h3>
                      <p>{item.sku || ''}</p>
                      <strong>{formatVnd(item.unit_price)}</strong>
                    </div>

                    <div className="cart-item__actions">
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, Number(item.quantity || 0) - 1)}
                          disabled={submittingProductId === productId || Number(item.quantity || 0) <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, Number(item.quantity || 0) + 1)}
                          disabled={submittingProductId === productId}
                        >
                          +
                        </button>
                      </div>

                      <p className="cart-line-total">{formatVnd(lineTotal)}</p>

                      <button
                        type="button"
                        className="cart-remove-btn"
                        onClick={() => removeItem(item)}
                        disabled={submittingProductId === productId}
                      >
                        Xóa
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary">
              <h2>Tạm tính</h2>
              <p>
                <span>Tổng tiền hàng</span>
                <strong>{formatVnd(totalAmount)}</strong>
              </p>
              <p>
                <span>Số lượng</span>
                <strong>{totalQuantity}</strong>
              </p>

              <button type="button" disabled>
                Thanh toán (sẽ triển khai tiếp)
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default Cart;
