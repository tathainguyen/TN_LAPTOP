import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getUserCart } from '../../services/cart/cartService.js';
import { getCheckoutData, placeCodOrder } from '../../services/order/orderService.js';

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

function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [user] = useState(() => getStoredUser());
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [form, setForm] = useState({
    user_address_id: '',
    shipping_method_id: '',
    customer_note: '',
  });

  useEffect(() => {
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }

    async function loadCheckoutData() {
      try {
        setLoading(true);

        const [cartResponse, checkoutResponse] = await Promise.all([
          getUserCart(user.id),
          getCheckoutData(user.id),
        ]);

        const items = cartResponse?.data?.items || [];
        setCartItems(items);

        const nextAddresses = checkoutResponse?.data?.addresses || [];
        const nextShippingMethods = checkoutResponse?.data?.shipping_methods || [];
        setAddresses(nextAddresses);
        setShippingMethods(nextShippingMethods);

        const defaultAddress = nextAddresses.find((item) => Number(item.is_default) === 1) || nextAddresses[0];
        const defaultShipping = nextShippingMethods[0];

        setForm((prev) => ({
          ...prev,
          user_address_id: defaultAddress ? String(defaultAddress.id) : '',
          shipping_method_id: defaultShipping ? String(defaultShipping.id) : '',
        }));
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải dữ liệu thanh toán.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [navigate, user?.id]);

  const selectedShippingMethod = useMemo(
    () => shippingMethods.find((item) => String(item.id) === String(form.shipping_method_id)) || null,
    [shippingMethods, form.shipping_method_id]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0),
    [cartItems]
  );

  const shippingFee = Number(selectedShippingMethod?.fee || 0);
  const grandTotal = subtotal + shippingFee;

  async function handlePlaceCodOrder(event) {
    event.preventDefault();

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để đặt hàng.');
      navigate('/login', { replace: true });
      return;
    }

    if (!form.user_address_id) {
      toast.error('Vui lòng chọn địa chỉ giao hàng.');
      return;
    }

    if (!form.shipping_method_id) {
      toast.error('Vui lòng chọn phương thức vận chuyển.');
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await placeCodOrder({
        user_id: user.id,
        user_address_id: Number(form.user_address_id),
        shipping_method_id: Number(form.shipping_method_id),
        customer_note: form.customer_note?.trim() || null,
      });

      window.dispatchEvent(new Event('tn-laptop-cart-change'));
      toast.success(response?.message || 'Đặt hàng COD thành công.');
      navigate('/account/orders', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể đặt hàng COD lúc này.';
      toast.error(message);
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <main className="checkout-page">
        <section className="checkout-shell">
          <div className="cart-empty">Đang tải dữ liệu thanh toán...</div>
        </section>
      </main>
    );
  }

  if (!cartItems.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-shell">
          <div className="cart-empty">
            <p>Giỏ hàng đang trống, chưa thể thanh toán.</p>
            <Link to="/product" className="cart-go-shopping">Tiếp tục mua sắm</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-shell">
        <header className="checkout-head">
          <h1>Thanh toán COD</h1>
          <p>Xác nhận địa chỉ và phương thức giao hàng trước khi đặt.</p>
        </header>

        <form className="checkout-grid" onSubmit={handlePlaceCodOrder}>
          <div className="checkout-main">
            <article className="checkout-card">
              <h2>Địa chỉ giao hàng</h2>
              {addresses.length === 0 ? (
                <p className="checkout-warning">
                  Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ trong
                  {' '}
                  <Link to="/account/addresses">Sổ địa chỉ</Link>.
                </p>
              ) : (
                <div className="checkout-address-list">
                  {addresses.map((address) => (
                    <label key={address.id} className="checkout-address-item">
                      <input
                        type="radio"
                        name="address"
                        checked={String(form.user_address_id) === String(address.id)}
                        onChange={() =>
                          setForm((prev) => ({ ...prev, user_address_id: String(address.id) }))
                        }
                      />
                      <div>
                        <strong>{address.recipient_name} - {address.recipient_phone}</strong>
                        <p>
                          {address.address_line}, {address.ward}, {address.district}, {address.province}
                        </p>
                        {address.address_note ? <span>Ghi chú: {address.address_note}</span> : null}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </article>

            <article className="checkout-card">
              <h2>Vận chuyển</h2>
              <div className="checkout-ship-list">
                {shippingMethods.map((method) => (
                  <label key={method.id} className="checkout-ship-item">
                    <input
                      type="radio"
                      name="shipping"
                      checked={String(form.shipping_method_id) === String(method.id)}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, shipping_method_id: String(method.id) }))
                      }
                    />
                    <div>
                      <strong>{method.method_name}</strong>
                      <p>{method.description || '-'}</p>
                    </div>
                    <b>{formatVnd(method.fee)}</b>
                  </label>
                ))}
              </div>
            </article>

            <article className="checkout-card">
              <h2>Lời nhắn cho shop</h2>
              <textarea
                rows={3}
                value={form.customer_note}
                onChange={(event) => setForm((prev) => ({ ...prev, customer_note: event.target.value }))}
                placeholder="Ví dụ: Giao trong giờ hành chính, gọi trước khi đến"
              />
            </article>
          </div>

          <aside className="checkout-summary">
            <h2>Đơn hàng của bạn</h2>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div className="checkout-item-row" key={`${item.product_id}-${item.sku}`}>
                  <div className="checkout-item-main">
                    <strong>{item.product_name}</strong>
                    <span>
                      SL: {item.quantity} x {formatVnd(item.unit_price || 0)}
                    </span>
                  </div>
                  <b>{formatVnd(Number(item.quantity) * Number(item.unit_price || 0))}</b>
                </div>
              ))}
            </div>

            <hr />
            <p>
              <span>Tạm tính</span>
              <strong>{formatVnd(subtotal)}</strong>
            </p>
            <p>
              <span>Phí vận chuyển</span>
              <strong>{formatVnd(shippingFee)}</strong>
            </p>
            <p className="checkout-total">
              <span>Tổng cộng</span>
              <strong>{formatVnd(grandTotal)}</strong>
            </p>

            <button
              type="submit"
              disabled={placingOrder || !addresses.length || !shippingMethods.length}
            >
              {placingOrder ? 'Đang tạo đơn...' : 'Đặt hàng COD'}
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
}

export default Checkout;
