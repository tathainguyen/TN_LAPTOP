import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getUserCart } from '../../services/cart/cartService.js';
import { getCheckoutData, placeCodOrder } from '../../services/order/orderService.js';
import { createAddress } from '../../services/address/addressService.js';

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

const ADDRESS_DATA = {
  'TP. Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Ông Lãnh', 'Phường Nguyễn Thái Bình'],
    'Quận 3': ['Phường Võ Thị Sáu', 'Phường 4', 'Phường 5', 'Phường 6'],
    'Quận 7': ['Phường Tân Phú', 'Phường Tân Phong', 'Phường Tân Kiểng', 'Phường Phú Mỹ'],
    'Quận Bình Thạnh': ['Phường 13', 'Phường 14', 'Phường 15', 'Phường 22'],
    'Thành phố Thủ Đức': ['Phường An Phú', 'Phường Thảo Điền', 'Phường Hiệp Bình Chánh', 'Phường Linh Đông'],
  },
  'Hà Nội': {
    'Quận Ba Đình': ['Phường Liễu Giai', 'Phường Kim Mã', 'Phường Ngọc Hà', 'Phường Đội Cấn'],
    'Quận Hoàn Kiếm': ['Phường Hàng Bạc', 'Phường Hàng Bông', 'Phường Tràng Tiền', 'Phường Cửa Đông'],
    'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Yên Hòa'],
    'Quận Đống Đa': ['Phường Láng Thượng', 'Phường Trung Liệt', 'Phường Ô Chợ Dừa', 'Phường Văn Miếu'],
    'Quận Hà Đông': ['Phường Mộ Lao', 'Phường Nguyễn Trãi', 'Phường Văn Quán', 'Phường Phú La'],
  },
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Bình Hiên', 'Phường Hòa Thuận Tây'],
    'Quận Thanh Khê': ['Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Xuân Hà', 'Phường Chính Gián'],
    'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường Nại Hiên Đông', 'Phường Mân Thái'],
    'Quận Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải'],
  },
  'Cần Thơ': {
    'Quận Ninh Kiều': ['Phường Tân An', 'Phường An Cư', 'Phường An Nghiệp', 'Phường Xuân Khánh'],
    'Quận Bình Thủy': ['Phường Bình Thủy', 'Phường Trà An', 'Phường Long Hòa', 'Phường Bùi Hữu Nghĩa'],
    'Quận Cái Răng': ['Phường Lê Bình', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Ba Láng'],
  },
  'Hải Phòng': {
    'Quận Hồng Bàng': ['Phường Hạ Lý', 'Phường Minh Khai', 'Phường Sở Dầu', 'Phường Quán Toan'],
    'Quận Ngô Quyền': ['Phường Máy Tơ', 'Phường Lạch Tray', 'Phường Cầu Đất', 'Phường Đằng Giang'],
    'Quận Lê Chân': ['Phường An Biên', 'Phường Trại Cau', 'Phường Kênh Dương', 'Phường Vĩnh Niệm'],
  },
};

const FALLBACK_DISTRICTS = [
  'Quận 1',
  'Quận 3',
  'Quận 7',
  'Thành phố Thủ Đức',
  'Quận Cầu Giấy',
  'Quận Đống Đa',
  'Quận Hải Châu',
  'Quận Sơn Trà',
  'Quận Ninh Kiều',
  'Quận Hồng Bàng',
];

const FALLBACK_WARDS = [
  'Phường Bến Nghé',
  'Phường Thảo Điền',
  'Phường Dịch Vọng',
  'Phường Kim Mã',
  'Phường Hải Châu I',
  'Phường An Hải Bắc',
  'Phường Tân An',
  'Phường Lạch Tray',
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function filterSuggestions(options, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  return options
    .filter((option) => {
      if (!normalizedKeyword) {
        return true;
      }

      return normalizeText(option).includes(normalizedKeyword);
    })
    .slice(0, 8);
}

const SHIPPING_METHOD_LABELS = {
  EXPRESS: { name: 'Hỏa tốc', description: 'Trong ngày' },
  FAST: { name: 'Nhanh', description: '2 - 4 ngày' },
  SAVING: { name: 'Tiết kiệm', description: '4 - 7 ngày' },
};

function getShippingMethodView(method) {
  const key = String(method?.method_code || '').toUpperCase();
  const fallback = SHIPPING_METHOD_LABELS[key] || null;

  return {
    name: fallback?.name || String(method?.method_name || '').trim() || 'Phương thức vận chuyển',
    description: fallback?.description || String(method?.description || '').trim() || '-',
  };
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
    payment_method: 'COD',
    online_provider: 'VNPAY',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    province: '',
    district: '',
    ward: '',
    address_line: '',
    is_default: false,
  });
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      localStorage.setItem('tn_laptop_auth_return_url', '/cart');
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
  const provinceOptions = useMemo(
    () => filterSuggestions(Object.keys(ADDRESS_DATA), addressForm.province),
    [addressForm.province]
  );
  const selectedProvince = useMemo(
    () => Object.keys(ADDRESS_DATA).find(
      (province) => normalizeText(province) === normalizeText(addressForm.province)
    ),
    [addressForm.province]
  );
  const districtSource = selectedProvince
    ? Object.keys(ADDRESS_DATA[selectedProvince])
    : FALLBACK_DISTRICTS;
  const districtOptions = useMemo(
    () => filterSuggestions(districtSource, addressForm.district),
    [districtSource, addressForm.district]
  );
  const selectedDistrict = useMemo(
    () => (selectedProvince
      ? Object.keys(ADDRESS_DATA[selectedProvince]).find(
        (district) => normalizeText(district) === normalizeText(addressForm.district)
      )
      : null),
    [selectedProvince, addressForm.district]
  );
  const wardSource = selectedProvince && selectedDistrict
    ? ADDRESS_DATA[selectedProvince][selectedDistrict]
    : FALLBACK_WARDS;
  const wardOptions = useMemo(
    () => filterSuggestions(wardSource, addressForm.ward),
    [wardSource, addressForm.ward]
  );

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

  function resetAddressForm() {
    setAddressForm({
      recipient_name: '',
      recipient_phone: '',
      province: '',
      district: '',
      ward: '',
      address_line: '',
      is_default: false,
    });
    setShowAddressForm(false);
  }

  function updateAddressField(field, value) {
    setAddressForm((prev) => {
      if (field === 'province') {
        return { ...prev, province: value, district: '', ward: '' };
      }

      if (field === 'district') {
        return { ...prev, district: value, ward: '' };
      }

      return { ...prev, [field]: value };
    });
  }

  async function handleAddressSubmit() {
    if (!addressForm.recipient_name.trim()) {
      toast.error('Vui lòng nhập tên người nhận.');
      return;
    }

    if (!addressForm.recipient_phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại.');
      return;
    }

    if (!addressForm.province.trim()) {
      toast.error('Vui lòng nhập tỉnh/thành phố.');
      return;
    }

    if (!addressForm.district.trim()) {
      toast.error('Vui lòng nhập quận/huyện.');
      return;
    }

    if (!addressForm.ward.trim()) {
      toast.error('Vui lòng nhập phường/xã.');
      return;
    }

    if (!addressForm.address_line.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết.');
      return;
    }

    try {
      setAddingAddress(true);

      const payload = {
        recipient_name: addressForm.recipient_name.trim(),
        recipient_phone: addressForm.recipient_phone.trim(),
        province: addressForm.province.trim(),
        district: addressForm.district.trim(),
        ward: addressForm.ward.trim(),
        address_line: addressForm.address_line.trim(),
        is_default: addressForm.is_default ? 1 : 0,
      };

      const response = await createAddress(user.id, payload);

      if (response?.status !== 'success' || !response?.data) {
        toast.error(response?.message || 'Lưu địa chỉ thất bại.');
        return;
      }

      const newAddress = response.data;
      setAddresses((prev) => {
        const nextList = addressForm.is_default
          ? prev.map((item) => ({ ...item, is_default: 0 }))
          : prev;

        return [...nextList, newAddress];
      });

      setForm((prev) => ({
        ...prev,
        user_address_id: String(newAddress.id),
      }));

      toast.success('Thêm địa chỉ thành công.');
      resetAddressForm();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu địa chỉ.';
      toast.error(message);
    } finally {
      setAddingAddress(false);
    }
  }

  async function handlePlaceCodOrder(event) {
    event.preventDefault();

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để đặt hàng.');
      localStorage.setItem('tn_laptop_auth_return_url', '/cart');
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
              <button
                type="button"
                className="checkout-add-address"
                onClick={() => {
                  if (showAddressForm) {
                    resetAddressForm();
                    return;
                  }

                  setShowAddressForm(true);
                }}
                disabled={addingAddress}
              >
                {showAddressForm ? 'Hủy' : '+ Thêm địa chỉ mới'}
              </button>
            </div>

            {showAddressForm ? (
              <div className="checkout-address-form-panel">
                <div className="checkout-address-grid">
                  <label>
                    Tên người nhận
                    <input
                      type="text"
                      value={addressForm.recipient_name}
                      onChange={(event) => updateAddressField('recipient_name', event.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      disabled={addingAddress}
                    />
                  </label>

                  <label>
                    Số điện thoại
                    <input
                      type="tel"
                      value={addressForm.recipient_phone}
                      onChange={(event) => updateAddressField('recipient_phone', event.target.value)}
                      placeholder="Ví dụ: 0901234567"
                      disabled={addingAddress}
                    />
                  </label>

                  <label>
                    Tỉnh / Thành phố
                    <input
                      type="text"
                      list="checkout-province-options"
                      value={addressForm.province}
                      onChange={(event) => updateAddressField('province', event.target.value)}
                      placeholder="Ví dụ: TP. Hồ Chí Minh"
                      disabled={addingAddress}
                    />
                    <datalist id="checkout-province-options">
                      {provinceOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>

                  <label>
                    Quận / Huyện
                    <input
                      type="text"
                      list="checkout-district-options"
                      value={addressForm.district}
                      onChange={(event) => updateAddressField('district', event.target.value)}
                      placeholder="Ví dụ: Quận 1"
                      disabled={addingAddress}
                    />
                    <datalist id="checkout-district-options">
                      {districtOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>

                  <label>
                    Phường / Xã
                    <input
                      type="text"
                      list="checkout-ward-options"
                      value={addressForm.ward}
                      onChange={(event) => updateAddressField('ward', event.target.value)}
                      placeholder="Ví dụ: Phường Bến Nghé"
                      disabled={addingAddress}
                    />
                    <datalist id="checkout-ward-options">
                      {wardOptions.map((option) => (
                        <option key={option} value={option} />
                      ))}
                    </datalist>
                  </label>

                  <label className="checkout-address-full-width">
                    Địa chỉ chi tiết
                    <input
                      type="text"
                      value={addressForm.address_line}
                      onChange={(event) => updateAddressField('address_line', event.target.value)}
                      placeholder="Ví dụ: 12 Nguyễn Huệ"
                      disabled={addingAddress}
                    />
                  </label>

                  <label className="checkout-address-checkbox">
                    <input
                      type="checkbox"
                      checked={addressForm.is_default}
                      onChange={(event) => updateAddressField('is_default', event.target.checked)}
                      disabled={addingAddress}
                    />
                    <span>Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>

                <div className="checkout-address-form-actions">
                  <button type="button" onClick={handleAddressSubmit} disabled={addingAddress}>
                    {addingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                  <button
                    type="button"
                    className="checkout-address-cancel"
                    onClick={resetAddressForm}
                    disabled={addingAddress}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : null}

            {addresses.length === 0 ? (
              <p className="checkout-warning">
                Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới ngay tại đây.
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
                      <strong>{getShippingMethodView(method).name}</strong>
                      <p>{getShippingMethodView(method).description}</p>
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
