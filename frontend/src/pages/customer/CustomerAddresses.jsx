import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../services/address/addressService.js';

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
  return value.trim().toLowerCase();
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

function CustomerAddresses() {
  const { user } = useOutletContext();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    province: '',
    district: '',
    ward: '',
    address_line: '',
    is_default: false,
  });

  const provinceOptions = useMemo(() => filterSuggestions(Object.keys(ADDRESS_DATA), form.province), [form.province]);
  const selectedProvince = useMemo(
    () => Object.keys(ADDRESS_DATA).find((province) => normalizeText(province) === normalizeText(form.province)),
    [form.province]
  );
  const districtSource = selectedProvince ? Object.keys(ADDRESS_DATA[selectedProvince]) : FALLBACK_DISTRICTS;
  const districtOptions = useMemo(() => filterSuggestions(districtSource, form.district), [districtSource, form.district]);
  const selectedDistrict = useMemo(
    () => (selectedProvince
      ? Object.keys(ADDRESS_DATA[selectedProvince]).find((district) => normalizeText(district) === normalizeText(form.district))
      : null),
    [selectedProvince, form.district]
  );
  const wardSource = selectedProvince && selectedDistrict ? ADDRESS_DATA[selectedProvince][selectedDistrict] : FALLBACK_WARDS;
  const wardOptions = useMemo(() => filterSuggestions(wardSource, form.ward), [wardSource, form.ward]);

  useEffect(() => {
    if (user?.id) {
      loadAddresses();
    }
  }, [user?.id]);

  async function loadAddresses() {
    try {
      const response = await getAddresses(user.id);
      if (response.status === 'success') {
        setAddresses(response.data || []);
      }
    } catch (error) {
      console.error('❌ Lỗi tải địa chỉ:', error);
      toast.error('Không thể tải danh sách địa chỉ.');
    }
  }

  function resetForm() {
    setForm({
      recipient_name: '',
      recipient_phone: '',
      province: '',
      district: '',
      ward: '',
      address_line: '',
      is_default: false,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function updateField(field, value) {
    setForm((prev) => {
      if (field === 'province') {
        return { ...prev, province: value, district: '', ward: '' };
      }
      if (field === 'district') {
        return { ...prev, district: value, ward: '' };
      }
      return { ...prev, [field]: value };
    });
  }

  function handleEditClick(address) {
    setForm({
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address_line: address.address_line,
      is_default: address.is_default === 1,
    });
    setEditingId(address.id);
    setShowForm(true);
  }

  function requestDelete(address) {
    setDeleteTarget(address);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await deleteAddress(user.id, deleteTarget.id);

      if (response.status === 'success') {
        toast.success('Xóa địa chỉ thành công.');
        setDeleteTarget(null);
        await loadAddresses();
      } else {
        toast.error(response.message || 'Xóa địa chỉ thất bại.');
      }
    } catch (error) {
      console.error('❌ Lỗi xóa địa chỉ:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa địa chỉ.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.recipient_name.trim()) {
      toast.error('Vui lòng nhập tên người nhận.');
      return;
    }
    if (!form.recipient_phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại.');
      return;
    }
    if (!form.province.trim()) {
      toast.error('Vui lòng nhập tỉnh/thành phố.');
      return;
    }
    if (!form.district.trim()) {
      toast.error('Vui lòng nhập quận/huyện.');
      return;
    }
    if (!form.ward.trim()) {
      toast.error('Vui lòng nhập phường/xã.');
      return;
    }
    if (!form.address_line.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        recipient_name: form.recipient_name.trim(),
        recipient_phone: form.recipient_phone.trim(),
        province: form.province.trim(),
        district: form.district.trim(),
        ward: form.ward.trim(),
        address_line: form.address_line.trim(),
        is_default: form.is_default ? 1 : 0,
      };

      let response;
      if (editingId) {
        response = await updateAddress(user.id, editingId, payload);
      } else {
        response = await createAddress(user.id, payload);
      }

      if (response.status === 'success') {
        toast.success(editingId ? 'Cập nhật địa chỉ thành công.' : 'Thêm địa chỉ thành công.');
        resetForm();
        await loadAddresses();
      } else {
        toast.error(response.message || 'Lưu địa chỉ thất bại.');
      }
    } catch (error) {
      console.error('❌ Lỗi lưu địa chỉ:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu địa chỉ.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="customer-card">
      <div className="customer-card-head">
        <h2>Sổ địa chỉ</h2>
        <button 
          type="button" 
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          disabled={isLoading}
        >
          {showForm ? 'Hủy' : '+ Thêm địa chỉ'}
        </button>
      </div>

      {showForm && (
        <form className="customer-address-form-panel" onSubmit={handleSubmit}>
          <div className="customer-address-form-header">
            <div>
              <h3>{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
              <p>Nhập thông tin rõ ràng để đặt hàng và giao nhận chính xác hơn.</p>
            </div>
            <button type="button" className="customer-address-close-btn" onClick={resetForm} disabled={isLoading} aria-label="Đóng form địa chỉ">
              <X size={18} />
            </button>
          </div>

          <div className="customer-address-grid">
            <label>
              Tên người nhận
              <input
                type="text"
                value={form.recipient_name}
                onChange={(e) => updateField('recipient_name', e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                disabled={isLoading}
              />
            </label>

            <label>
              Số điện thoại
              <input
                type="text"
                value={form.recipient_phone}
                onChange={(e) => updateField('recipient_phone', e.target.value)}
                placeholder="0912 345 678"
                disabled={isLoading}
              />
            </label>

            <label>
              Tỉnh/Thành phố
              <input
                type="text"
                value={form.province}
                onChange={(e) => updateField('province', e.target.value)}
                list="province-suggestions"
                autoComplete="off"
                placeholder="TP. Hồ Chí Minh, Hà Nội..."
                disabled={isLoading}
              />
              
            </label>

            <datalist id="province-suggestions">
              {provinceOptions.map((province) => (
                <option key={province} value={province} />
              ))}
            </datalist>

            <label>
              Quận/Huyện
              <input
                type="text"
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                list="district-suggestions"
                autoComplete="off"
                placeholder={selectedProvince ? 'Nhập hoặc chọn quận/huyện' : 'Chọn tỉnh/thành trước'}
                disabled={isLoading || !form.province.trim()}
              />
             
            </label>

            <datalist id="district-suggestions">
              {districtOptions.map((district) => (
                <option key={district} value={district} />
              ))}
            </datalist>

            <label>
              Phường/Xã
              <input
                type="text"
                value={form.ward}
                onChange={(e) => updateField('ward', e.target.value)}
                list="ward-suggestions"
                autoComplete="off"
                placeholder={selectedDistrict ? 'Nhập hoặc chọn phường/xã' : 'Chọn quận/huyện trước'}
                disabled={isLoading || !form.district.trim()}
              />
              
            </label>

            <datalist id="ward-suggestions">
              {wardOptions.map((ward) => (
                <option key={ward} value={ward} />
              ))}
            </datalist>

            <label className="customer-address-span-2">
              Địa chỉ chi tiết
              <input
                type="text"
                value={form.address_line}
                onChange={(e) => updateField('address_line', e.target.value)}
                placeholder="Số nhà, tên đường, tòa nhà..."
                disabled={isLoading}
              />
            </label>

            <label className="customer-checkbox-row customer-address-span-2">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => updateField('is_default', e.target.checked)}
                disabled={isLoading}
              />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>
          </div>

          <div className="customer-form-actions customer-address-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? (editingId ? 'Đang cập nhật...' : 'Đang thêm...') : (editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ')}
            </button>
          </div>
        </form>
      )}

      <div className="customer-address-list">
        {addresses && addresses.length > 0 ? (
          addresses.map((address) => (
            <article className="customer-address-item" key={address.id}>
              <header>
                <h4>{address.recipient_name}</h4>
                {address.is_default === 1 ? <span>Mặc định</span> : null}
              </header>
              <p>{address.recipient_phone}</p>
              <p>
                {address.address_line}, {address.ward}, {address.district}, {address.province}
              </p>
              <div>
                <button type="button" onClick={() => handleEditClick(address)} disabled={isLoading}>
                  Sửa
                </button>
                <button type="button" onClick={() => requestDelete(address)} disabled={isLoading}>
                  Xóa
                </button>
              </div>
            </article>
          ))
        ) : <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>Chưa có địa chỉ nào. Hãy thêm một địa chỉ mới!</p>}
      </div>

      {deleteTarget ? (
        <div className="customer-delete-modal-overlay" role="presentation" onClick={closeDeleteModal}>
          <div className="customer-delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-address-title" onClick={(event) => event.stopPropagation()}>
            <h3 id="delete-address-title">Xác nhận xóa địa chỉ</h3>
            <p>
              Bạn có chắc muốn xóa địa chỉ của <strong>{deleteTarget.recipient_name}</strong> không?
              Hành động này không thể hoàn tác.
            </p>
            <div className="customer-delete-modal-actions">
              <button type="button" className="customer-delete-cancel-btn" onClick={closeDeleteModal} disabled={isLoading}>
                Hủy
              </button>
              <button type="button" className="customer-delete-confirm-btn" onClick={confirmDelete} disabled={isLoading}>
                {isLoading ? 'Đang xóa...' : 'Xóa địa chỉ'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CustomerAddresses;

