import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  getStorefrontVouchers,
  saveVoucherToWallet,
} from '../../services/voucher/voucherService.js';

const STORE_VOUCHER_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'percent', label: '% giảm' },
  { key: 'fixed', label: 'Giảm tiền' },
  { key: 'expiring', label: 'Sắp hết hạn' },
];

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
  }).format(date);
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('tn_laptop_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getVoucherTitle(voucher) {
  const type = String(voucher?.discount_type || '').toUpperCase();
  const value = Number(voucher?.discount_value || 0);

  if (type === 'PERCENT') {
    return `Giảm ${value}%`;
  }

  return `Giảm ${formatVnd(value)}`;
}

function getVoucherCondition(voucher) {
  const minOrder = Number(voucher?.min_order_value || 0);
  if (minOrder <= 0) {
    return 'Đơn tối thiểu 0đ';
  }

  return `Đơn tối thiểu ${formatVnd(minOrder)}`;
}

function getVoucherSubText(voucher) {
  const maxDiscount = voucher?.max_discount_value === null
    ? null
    : Number(voucher?.max_discount_value || 0);

  if (maxDiscount && maxDiscount > 0) {
    return `Giảm tối đa ${formatVnd(maxDiscount)}`;
  }

  return 'Không giới hạn mức giảm tối đa';
}

function getVoucherUsageText(voucher) {
  const used = Math.max(0, Number(voucher?.used_count || 0));
  const limit = voucher?.total_usage_limit === null
    ? null
    : Math.max(0, Number(voucher?.total_usage_limit || 0));

  if (limit === null || limit === 0) {
    return `Đã dùng ${used} lượt`;
  }

  return `Đã dùng ${used}/${limit} lượt`;
}

function Vouchers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingVoucherId, setSavingVoucherId] = useState(null);
  const [justSavedVoucherId, setJustSavedVoucherId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [user, setUser] = useState(() => getStoredUser());
  const [voucherItems, setVoucherItems] = useState([]);

  useEffect(() => {
    function syncAuthState() {
      setUser(getStoredUser());
    }

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('tn-laptop-auth-change', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('tn-laptop-auth-change', syncAuthState);
    };
  }, []);

  useEffect(() => {
    async function loadVouchers() {
      try {
        setLoading(true);
        const response = await getStorefrontVouchers(user?.id || null);
        setVoucherItems(response?.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải danh sách voucher.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadVouchers();
  }, [user?.id]);

  const activeCount = useMemo(
    () => voucherItems.filter((item) => Number(item?.is_active) === 1).length,
    [voucherItems]
  );

  const filteredVouchers = useMemo(() => {
    if (activeFilter === 'all') {
      return voucherItems;
    }

    if (activeFilter === 'percent') {
      return voucherItems.filter((item) => String(item?.discount_type || '').toUpperCase() === 'PERCENT');
    }

    if (activeFilter === 'fixed') {
      return voucherItems.filter((item) => String(item?.discount_type || '').toUpperCase() === 'FIXED');
    }

    if (activeFilter === 'expiring') {
      const now = new Date();
      const threshold = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

      return voucherItems.filter((item) => {
        const endAt = new Date(item?.end_at);
        return !Number.isNaN(endAt.getTime()) && endAt >= now && endAt <= threshold;
      });
    }

    return voucherItems;
  }, [activeFilter, voucherItems]);

  useEffect(() => {
    if (!justSavedVoucherId) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setJustSavedVoucherId(null);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [justSavedVoucherId]);

  async function handleSaveVoucher(voucher) {
    if (!user?.id) {
      localStorage.setItem('tn_laptop_auth_return_url', '/vouchers');
      navigate('/login', { state: { from: '/vouchers' } });
      return;
    }

    try {
      setSavingVoucherId(Number(voucher.id));
      const response = await saveVoucherToWallet({
        userId: user.id,
        voucherId: voucher.id,
      });

      const alreadySaved = Boolean(response?.data?.already_saved);
      toast.success(alreadySaved ? 'Voucher đã có sẵn trong kho của bạn.' : 'Đã lưu voucher vào kho của bạn.');

      setVoucherItems((prev) =>
        prev.map((item) => (
          Number(item.id) === Number(voucher.id)
            ? { ...item, is_saved: true }
            : item
        ))
      );

      if (!alreadySaved) {
        setJustSavedVoucherId(Number(voucher.id));
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu voucher lúc này.';
      toast.error(message);
    } finally {
      setSavingVoucherId(null);
    }
  }

  return (
    <main className="store-voucher-page">
      <section className="store-voucher-hero">
        <div className="store-voucher-hero-left">
          <p className="store-voucher-badge">VOUCHER HUB</p>
          <h1>Chọn voucher thông minh cho đơn hàng của bạn</h1>
          <p>
            Thu thập mã giảm giá, lưu vào kho và áp dụng nhanh khi thanh toán.
            Các mã mới tạo trong hệ thống sẽ tự động hiển thị tại đây.
          </p>
          <div className="store-voucher-hero-meta">
            <span>{voucherItems.length} voucher khả dụng</span>
            <span>{activeCount} voucher đang hoạt động</span>
          </div>
        </div>

        <div className="store-voucher-hero-right" aria-hidden="true">
          <div className="store-voucher-hero-ticket">
            <strong>ƯU ĐÃI</strong>
            <span>HOT</span>
          </div>
          <div className="store-voucher-hero-box" />
          <div className="store-voucher-hero-car" />
        </div>
      </section>

      <section className="store-voucher-grid-wrap">
        <div className="store-voucher-filter-row">
          {STORE_VOUCHER_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`store-voucher-filter-btn ${activeFilter === filter.key ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
          <span className="store-voucher-filter-count">{filteredVouchers.length} kết quả</span>
        </div>

        {loading ? (
          <div className="store-voucher-empty">Đang tải danh sách voucher...</div>
        ) : filteredVouchers.length === 0 ? (
          <div className="store-voucher-empty">Hiện chưa có voucher nào khả dụng.</div>
        ) : (
          <div className="store-voucher-grid">
            {filteredVouchers.map((voucher) => {
              const usagePercent = Math.max(0, Math.min(100, Number(voucher.usage_percent || 0)));
              const disabled = Boolean(voucher.is_saved) || savingVoucherId === Number(voucher.id);
              const isJustSaved = justSavedVoucherId === Number(voucher.id);

              return (
                <article
                  className={`store-voucher-ticket-card ${voucher.is_saved ? 'is-saved' : ''} ${isJustSaved ? 'is-just-saved' : ''}`}
                  key={voucher.id}
                >
                  <aside className="store-voucher-ticket-left">
                    <span className="store-voucher-ticket-icon">S</span>
                    <strong>{voucher.code}</strong>
                  </aside>

                  <div className="store-voucher-ticket-body">
                    <h3>{getVoucherTitle(voucher)}</h3>
                    <p>{getVoucherSubText(voucher)}</p>
                    <p className="store-voucher-ticket-condition">{getVoucherCondition(voucher)}</p>

                    <div className="store-voucher-progress-row">
                      <div className="store-voucher-progress-track">
                        <span style={{ width: `${usagePercent}%` }} />
                      </div>
                      <small>{getVoucherUsageText(voucher)} ({usagePercent}%)</small>
                    </div>

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSaveVoucher(voucher)}
                    >
                      {savingVoucherId === Number(voucher.id)
                        ? 'Đang lưu...'
                        : voucher.is_saved
                          ? 'Đã lưu'
                          : 'Lưu'}
                    </button>

                    <div className="store-voucher-ticket-foot">
                      <span>Có hiệu lực đến {formatDate(voucher.end_at)}</span>
                      <Link to="/account/vouchers">Kho voucher</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Vouchers;
