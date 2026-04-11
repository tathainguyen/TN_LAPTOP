import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCustomerVoucherWallet, saveVoucherToWallet } from '../../services/voucher/voucherService.js';

const WALLET_TABS = [
  { key: 'available', label: 'Có thể dùng' },
  { key: 'used', label: 'Đã dùng' },
  { key: 'expired', label: 'Hết hạn' },
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

  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(date);
}

function getVoucherTitle(voucher) {
  const type = String(voucher?.discount_type || '').toUpperCase();
  const value = Number(voucher?.discount_value || 0);

  if (type === 'PERCENT') {
    return `Giảm ${value}%`;
  }

  return `Giảm ${formatVnd(value)}`;
}

function getStatusLabel(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'AVAILABLE') return 'Sẵn sàng dùng';
  if (key === 'USED') return 'Đã sử dụng';
  if (key === 'EXPIRED') return 'Hết hạn';
  return key || '-';
}

function getUsageText(voucher) {
  const used = Math.max(0, Number(voucher?.used_count || 0));
  const limit = voucher?.total_usage_limit === null
    ? null
    : Math.max(0, Number(voucher?.total_usage_limit || 0));

  if (limit === null || limit === 0) {
    return `Đã dùng ${used} lượt`;
  }

  return `Đã dùng ${used}/${limit} lượt`;
}

function CustomerVouchers() {
  const { user } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [savingByCode, setSavingByCode] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [activeWalletTab, setActiveWalletTab] = useState('available');
  const [code, setCode] = useState('');

  useEffect(() => {
    async function loadWallet() {
      if (!user?.id) {
        setVouchers([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCustomerVoucherWallet(user.id);
        setVouchers(response?.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải kho voucher.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadWallet();
  }, [user?.id]);

  const availableCount = useMemo(
    () => vouchers.filter((item) => String(item.display_status || '').toUpperCase() === 'AVAILABLE').length,
    [vouchers]
  );

  const groupedCounts = useMemo(() => ({
    available: vouchers.filter((item) => String(item.display_status || '').toUpperCase() === 'AVAILABLE').length,
    used: vouchers.filter((item) => String(item.display_status || '').toUpperCase() === 'USED').length,
    expired: vouchers.filter((item) => String(item.display_status || '').toUpperCase() === 'EXPIRED').length,
  }), [vouchers]);

  const visibleVouchers = useMemo(() => vouchers.filter((item) => {
    const status = String(item.display_status || '').toUpperCase();
    if (activeWalletTab === 'available') {
      return status === 'AVAILABLE';
    }

    if (activeWalletTab === 'used') {
      return status === 'USED';
    }

    if (activeWalletTab === 'expired') {
      return status === 'EXPIRED';
    }

    return true;
  }), [activeWalletTab, vouchers]);

  async function handleApplyVoucher(event) {
    event.preventDefault();

    if (!code.trim()) {
      toast.error('Vui lòng nhập mã voucher.');
      return;
    }

    if (!user?.id) {
      toast.error('Bạn cần đăng nhập để lưu voucher.');
      return;
    }

    try {
      setSavingByCode(true);
      const response = await saveVoucherToWallet({ userId: user.id, code });
      const savedCode = String(response?.data?.code || code).toUpperCase();
      toast.success('Đã lưu voucher vào kho của bạn.');
      setCode('');

      const walletResponse = await getCustomerVoucherWallet(user.id);
      setVouchers(walletResponse?.data || []);

      if (!walletResponse?.data?.some((item) => String(item.code || '').toUpperCase() === savedCode)) {
        toast('Voucher đã xử lý nhưng chưa thấy trong kho, vui lòng tải lại trang.');
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu voucher lúc này.';
      toast.error(message);
    } finally {
      setSavingByCode(false);
    }
  }

  return (
    <section className="customer-card">
      <div className="customer-card-head customer-voucher-head">
        <div>
          <h2>Kho voucher</h2>
          <p>{availableCount} voucher khả dụng trong kho của bạn</p>
        </div>
        <Link to="/vouchers" className="customer-voucher-discover-link">Khám phá voucher</Link>
      </div>

      <form className="customer-voucher-form" onSubmit={handleApplyVoucher}>
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Nhập mã voucher để lưu"
        />
        <button type="submit" disabled={savingByCode}>
          {savingByCode ? 'Đang lưu...' : 'Lưu mã'}
        </button>
      </form>

      <div className="customer-voucher-list">
        <div className="customer-wallet-tabs">
          {WALLET_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`customer-wallet-tab ${activeWalletTab === tab.key ? 'is-active' : ''}`}
              onClick={() => setActiveWalletTab(tab.key)}
            >
              {tab.label}
              <span>{groupedCounts[tab.key]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="customer-empty-row">Đang tải kho voucher...</div>
        ) : visibleVouchers.length === 0 ? (
          <div className="customer-empty-row">Bạn chưa lưu voucher nào.</div>
        ) : (
          visibleVouchers.map((voucher) => (
            <article className="customer-wallet-ticket" key={voucher.user_voucher_id}>
              <aside className="customer-wallet-ticket-left">
                <strong>{voucher.code}</strong>
                <span>{getStatusLabel(voucher.display_status)}</span>
              </aside>

              <div className="customer-wallet-ticket-body">
                <h4>{getVoucherTitle(voucher)}</h4>
                <p>
                  {voucher.max_discount_value !== null && Number(voucher.max_discount_value || 0) > 0
                    ? `Tối đa giảm ${formatVnd(voucher.max_discount_value)}`
                    : 'Không giới hạn mức giảm tối đa'}
                </p>
                <span>{`Đơn tối thiểu ${formatVnd(voucher.min_order_value || 0)}`}</span>
                <span className="customer-wallet-usage">{getUsageText(voucher)}</span>

                <div className="customer-wallet-ticket-foot">
                  <small>HSD: {formatDate(voucher.end_at)}</small>
                  <strong className={`customer-wallet-status is-${String(voucher.display_status || '').toLowerCase()}`}>
                    {getStatusLabel(voucher.display_status)}
                  </strong>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default CustomerVouchers;

