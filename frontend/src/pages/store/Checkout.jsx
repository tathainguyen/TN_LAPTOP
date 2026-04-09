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

const VOUCHER_MAP = {
  MAGIAM100: {
    code: 'MAGIAM100',
    discount: 100000,
    label: 'Giảm 100.000đ',
    subtitle: 'Giảm tối đa 100,000đ',
    usedPercent: '16.7%',
  },
  FREESHIP50: {
    code: 'FREESHIP50',
    discount: 50000,
    label: 'Giảm 50.000đ',
    subtitle: 'Giảm tối đa 50,000đ',
    usedPercent: '16%',
  },
};

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
    payment_method: 'COD',
    online_provider: 'VNPAY',
  });
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

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
  const discountAmount = Number(appliedVoucher?.discount || 0);
  const grandTotal = Math.max(0, subtotal + shippingFee - discountAmount);
  const savedVouchers = useMemo(() => Object.values(VOUCHER_MAP), []);

  function handleApplyVoucher(rawCode = voucherInput) {
    const normalizedCode = String(rawCode || '').trim().toUpperCase();

    if (!normalizedCode) {
      toast.error('Vui lòng nhập mã voucher.');
      return;
    }

    const matchedVoucher = VOUCHER_MAP[normalizedCode] || null;

    if (!matchedVoucher) {
      toast.error('Mã voucher không hợp lệ hoặc đã hết hạn.');
      return;
    }

    setAppliedVoucher(matchedVoucher);
    setVoucherInput(matchedVoucher.code);
    setVoucherModalOpen(false);
    toast.success(`Áp dụng voucher thành công: ${matchedVoucher.label}`);
  }

  function handleClearVoucher() {
    setAppliedVoucher(null);
    setVoucherInput('');
  }

  function openVoucherModal() {
    setVoucherModalOpen(true);
  }

  function closeVoucherModal() {
    setVoucherModalOpen(false);
  }

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

    if (form.payment_method === 'ONLINE') {
      toast('Thanh toán online sẽ được triển khai ở bước tiếp theo. Vui lòng chọn COD để đặt hàng.', {
        icon: 'ℹ️',
      });
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
          <h1>Thanh toán</h1>
          <p>Kiểm tra thông tin đơn hàng và xác nhận trước khi đặt hàng.</p>
        </header>

        <form className="checkout-grid" onSubmit={handlePlaceCodOrder}>
          <article className="checkout-card checkout-card--address">
            <div className="checkout-card-headline">
              <h2>1. Chọn địa chỉ nhận hàng</h2>
              <Link className="checkout-add-address" to="/account/addresses">
                + Thêm địa chỉ mới
              </Link>
            </div>

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

          <article className="checkout-card checkout-card--products">
            <h2>2. Sản phẩm & vận chuyển</h2>

            <div className="checkout-product-table-wrap">
              <table className="checkout-product-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Tên sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={`${item.product_id}-${item.sku || ''}`}>
                      <td className="checkout-product-thumb-cell">
                        <img
                          src={item.primary_image || 'https://via.placeholder.com/120x80?text=No+Image'}
                          alt={item.product_name || 'Sản phẩm'}
                          className="checkout-product-thumb"
                        />
                      </td>
                      <td>
                        <p className="checkout-product-name">{item.product_name || 'Sản phẩm'}</p>
                        <p className="checkout-product-sku">{item.sku || '-'}</p>
                      </td>
                      <td>{formatVnd(item.unit_price)}</td>
                      <td>{item.quantity}</td>
                      <td className="checkout-product-line-total">
                        {formatVnd(Number(item.quantity || 0) * Number(item.unit_price || 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="checkout-shipping-section">
              <h3>Phương thức vận chuyển</h3>
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
            </div>

            <div className="checkout-voucher-row">
              <div className="checkout-voucher-brand">TN LAPTOP voucher</div>
              <button type="button" className="checkout-voucher-trigger" onClick={openVoucherModal}>
                Chọn hoặc nhập mã
              </button>
              <div className="checkout-voucher-code">
                Mã voucher:
                {' '}
                <strong>{appliedVoucher?.code || 'Chưa áp dụng'}</strong>
                {appliedVoucher ? (
                  <button type="button" className="checkout-voucher-clear-inline" onClick={handleClearVoucher}>
                    Bỏ mã
                  </button>
                ) : null}
              </div>
            </div>

            <div className="checkout-note-row">
              <label htmlFor="checkout-customer-note">Lời nhắn:</label>
              <input
                id="checkout-customer-note"
                type="text"
                value={form.customer_note}
                onChange={(event) => setForm((prev) => ({ ...prev, customer_note: event.target.value }))}
                placeholder="Lưu ý cho Người bán..."
              />
              <div className="checkout-inline-total">
                Tổng thanh toán ({cartItems.length} sản phẩm):
                {' '}
                <strong>{formatVnd(grandTotal)}</strong>
              </div>
            </div>
          </article>

          <article className="checkout-card checkout-card--payment">
            <h2>3. Thanh toán</h2>

            <div className="checkout-payment-box">
              <p className="checkout-payment-title">Phương thức thanh toán</p>

              <label className="checkout-payment-option">
                <input
                  type="radio"
                  name="payment_method"
                  checked={form.payment_method === 'COD'}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, payment_method: 'COD' }))
                  }
                />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>

              <label className="checkout-payment-option">
                <input
                  type="radio"
                  name="payment_method"
                  checked={form.payment_method === 'ONLINE'}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, payment_method: 'ONLINE' }))
                  }
                />
                <span>Thanh toán online</span>
              </label>

              {form.payment_method === 'ONLINE' ? (
                <div className="checkout-online-methods">
                  <label>
                    <input
                      type="radio"
                      name="online_provider"
                      checked={form.online_provider === 'VNPAY'}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, online_provider: 'VNPAY' }))
                      }
                    />
                    <span>VNPAY</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="online_provider"
                      checked={form.online_provider === 'PAYPAL'}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, online_provider: 'PAYPAL' }))
                      }
                    />
                    <span>PAYPAL</span>
                  </label>
                </div>
              ) : null}
            </div>

            <div className="checkout-summary-box">
              <p>
                <span>Tổng tiền hàng</span>
                <strong>{formatVnd(subtotal)}</strong>
              </p>
              <p>
                <span>Tổng giảm giá</span>
                <strong>- {formatVnd(discountAmount)}</strong>
              </p>
              <p>
                <span>Phí vận chuyển</span>
                <strong>{formatVnd(shippingFee)}</strong>
              </p>
              <p className="checkout-total">
                <span>Tổng thanh toán</span>
                <strong>{formatVnd(grandTotal)}</strong>
              </p>

              <button
                type="submit"
                disabled={placingOrder || !addresses.length || !shippingMethods.length}
              >
                {placingOrder
                  ? 'Đang tạo đơn...'
                  : form.payment_method === 'ONLINE'
                    ? 'Thanh toán online'
                    : 'Đặt hàng'}
              </button>
            </div>
          </article>
        </form>

        {voucherModalOpen ? (
          <div className="checkout-voucher-modal-overlay" onClick={closeVoucherModal}>
            <section className="checkout-voucher-modal" onClick={(event) => event.stopPropagation()}>
              <header className="checkout-voucher-modal-head">
                <h3>Chọn TN LAPTOP Voucher</h3>
                <button type="button" onClick={closeVoucherModal}>X</button>
              </header>

              <div className="checkout-voucher-modal-input-row">
                <label htmlFor="checkout-voucher-input">Mã Voucher</label>
                <input
                  id="checkout-voucher-input"
                  type="text"
                  value={voucherInput}
                  onChange={(event) => setVoucherInput(event.target.value)}
                  placeholder="Nhập mã voucher tại đây"
                />
                <button type="button" onClick={() => handleApplyVoucher(voucherInput)}>Áp dụng</button>
              </div>

              <div className="checkout-voucher-modal-list">
                {savedVouchers.map((voucher) => (
                  <article className="checkout-voucher-ticket" key={voucher.code}>
                    <div className="checkout-voucher-ticket-left">
                      <strong>{voucher.code}</strong>
                    </div>
                    <div className="checkout-voucher-ticket-body">
                      <p>{voucher.label}</p>
                      <span>{voucher.subtitle}</span>
                      <small>Đã dùng {voucher.usedPercent}</small>
                    </div>
                    <button type="button" onClick={() => handleApplyVoucher(voucher.code)}>
                      Dùng ngay
                    </button>
                  </article>
                ))}
              </div>

              <footer className="checkout-voucher-modal-foot">
                <button type="button" onClick={closeVoucherModal}>Hủy</button>
              </footer>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default Checkout;
