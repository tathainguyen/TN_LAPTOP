import toast from 'react-hot-toast';

const mockAddresses = [
  {
    id: 1,
    recipient: 'Đỗ Thành',
    phone: '0912 345 678',
    full: '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
    isDefault: true,
  },
  {
    id: 2,
    recipient: 'Đỗ Thành',
    phone: '0988 111 222',
    full: '35 Trần Phú, Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng',
    isDefault: false,
  },
];

function CustomerAddresses() {
  function notify(action) {
    toast.success(`Demo giao diện: ${action} địa chỉ (chức năng thật sẽ làm sau).`);
  }

  return (
    <section className="customer-card">
      <div className="customer-card-head">
        <h2>Sổ địa chỉ</h2>
        <button type="button" onClick={() => notify('Thêm')}>
          + Thêm địa chỉ
        </button>
      </div>

      <div className="customer-address-list">
        {mockAddresses.map((address) => (
          <article className="customer-address-item" key={address.id}>
            <header>
              <h4>{address.recipient}</h4>
              {address.isDefault ? <span>Mặc định</span> : null}
            </header>
            <p>{address.phone}</p>
            <p>{address.full}</p>
            <div>
              <button type="button" onClick={() => notify('Sửa')}>
                Sửa
              </button>
              <button type="button" onClick={() => notify('Xóa')}>
                Xóa
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CustomerAddresses;
