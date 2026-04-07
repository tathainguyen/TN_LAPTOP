import { useState } from 'react';
import toast from 'react-hot-toast';

const mockVouchers = [
  {
    id: 'VOUCHER10',
    description: 'Giảm 10% tối đa 500.000đ cho đơn từ 5.000.000đ',
    expiredAt: '2026-06-30',
  },
  {
    id: 'FREESHIP50',
    description: 'Miễn phí vận chuyển tối đa 50.000đ',
    expiredAt: '2026-05-15',
  },
];

function CustomerVouchers() {
  const [code, setCode] = useState('');

  function handleApplyVoucher(event) {
    event.preventDefault();

    if (!code.trim()) {
      toast.error('Vui lòng nhập mã voucher.');
      return;
    }

    toast.success('Demo giao diện: Đã nhận voucher thành công (chức năng thật sẽ làm sau).');
    setCode('');
  }

  return (
    <section className="customer-card">
      <h2>Kho voucher</h2>

      <form className="customer-voucher-form" onSubmit={handleApplyVoucher}>
        <input
          type="text"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Nhập mã voucher"
        />
        <button type="submit">Áp dụng</button>
      </form>

      <div className="customer-voucher-list">
        {mockVouchers.map((voucher) => (
          <article className="customer-voucher-item" key={voucher.id}>
            <h4>{voucher.id}</h4>
            <p>{voucher.description}</p>
            <span>HSD: {voucher.expiredAt}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CustomerVouchers;

