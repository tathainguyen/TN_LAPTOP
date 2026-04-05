import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

function splitName(fullName) {
  const chunks = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  if (chunks.length === 0) {
    return { firstName: '', lastName: '' };
  }

  if (chunks.length === 1) {
    return { firstName: '', lastName: chunks[0] };
  }

  return {
    firstName: chunks.slice(0, -1).join(' '),
    lastName: chunks[chunks.length - 1],
  };
}

function CustomerProfile() {
  const { user } = useOutletContext();

  const defaults = useMemo(() => {
    const fullName = user?.full_name || user?.fullName || '';
    const names = splitName(fullName);

    return {
      firstName: names.firstName,
      lastName: names.lastName,
      phone: user?.phone || '',
      address: '',
      gender: user?.gender || 'MALE',
      dateOfBirth: user?.date_of_birth ? String(user.date_of_birth).slice(0, 10) : '',
    };
  }, [user]);

  const [form, setForm] = useState(defaults);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    toast.success('Demo giao diện: Đã lưu thông tin cá nhân (chức năng thật sẽ hoàn thiện sau).');
  }

  return (
    <section className="customer-card">
      <h2>Thông tin cá nhân</h2>

      <form className="customer-profile-form" onSubmit={handleSubmit}>
        <label>
          Họ
          <input
            type="text"
            value={form.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            placeholder="Nhập họ"
          />
        </label>

        <label>
          Tên
          <input
            type="text"
            value={form.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            placeholder="Nhập tên"
          />
        </label>

        <label className="span-2">
          Số điện thoại
          <input
            type="text"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="0912 345 678"
          />
        </label>

        <label className="span-2">
          Địa chỉ
          <input
            type="text"
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
          />
        </label>

        <label>
          Giới tính
          <select value={form.gender} onChange={(event) => updateField('gender', event.target.value)}>
            <option value="MALE">Nam</option>
            <option value="FEMALE">Nữ</option>
            <option value="OTHER">Khác</option>
          </select>
        </label>

        <label>
          Ngày sinh
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(event) => updateField('dateOfBirth', event.target.value)}
          />
        </label>

        <label className="span-2">
          Chọn ảnh
          <div className="customer-upload-row">
            <button type="button" className="customer-upload-btn">
              Tải ảnh
            </button>
          </div>
        </label>

        <div className="span-2 customer-form-actions">
          <button type="submit">Lưu thông tin</button>
        </div>
      </form>
    </section>
  );
}

export default CustomerProfile;
