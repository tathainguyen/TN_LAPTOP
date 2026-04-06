import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateUserProfile } from '../services/userService.js';

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
  const { user, setUser } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Vui lòng nhập đầy đủ họ và tên.');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const payload = {
        full_name: fullName,
        phone: form.phone.trim() || null,
        gender: form.gender,
        date_of_birth: form.dateOfBirth || null,
      };

      console.log('📤 Gửi request cập nhật profile:', payload);
      const response = await updateUserProfile(user.id, payload);
      console.log('📥 Response từ server:', response);

      if (response.status === 'success' && response.data) {
        toast.success('Cập nhật thông tin cá nhân thành công.');
        
        // Update user context
        const updatedUser = response.data;
        setUser(updatedUser);
        
        // Update localStorage
        const storedUser = JSON.parse(localStorage.getItem('tn_laptop_user') || '{}');
        const newStoredUser = { ...storedUser, ...updatedUser };
        localStorage.setItem('tn_laptop_user', JSON.stringify(newStoredUser));

        // Dispatch auth change event
        window.dispatchEvent(new Event('tn-laptop-auth-change'));
      } else {
        toast.error(response.message || 'Cập nhật thông tin thất bại.');
      }
    } catch (error) {
      console.error('❌ Lỗi cập nhật profile:', error);
      const errMsg = error.response?.data?.message || error.message || 'Không thể cập nhật thông tin.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
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
            disabled={isLoading}
          />
        </label>

        <label>
          Tên
          <input
            type="text"
            value={form.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            placeholder="Nhập tên"
            disabled={isLoading}
          />
        </label>

        <label className="span-2">
          Số điện thoại
          <input
            type="text"
            value={form.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="0912 345 678"
            disabled={isLoading}
          />
        </label>

        <label className="span-2">
          Địa chỉ
          <input
            type="text"
            value={form.address}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            disabled={isLoading}
          />
        </label>

        <label>
          Giới tính
          <select 
            value={form.gender} 
            onChange={(event) => updateField('gender', event.target.value)}
            disabled={isLoading}
          >
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
            disabled={isLoading}
          />
        </label>

        <label className="span-2">
          Chọn ảnh
          <div className="customer-upload-row">
            <button type="button" className="customer-upload-btn" disabled={isLoading}>
              Tải ảnh
            </button>
          </div>
        </label>

        <div className="span-2 customer-form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CustomerProfile;
