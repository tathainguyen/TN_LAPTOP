import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  createBrand,
  getBrands,
  updateBrand,
} from '../services/catalogService.js';

function AdminBrandCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = Number(searchParams.get('edit') || 0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    brand_name: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        if (!editId) {
          return;
        }

        const response = await getBrands();
        const brands = response?.data || [];
        const target = brands.find((item) => Number(item.id) === editId);

        if (!target) {
          toast.error('Không tìm thấy nhãn hàng cần sửa.');
          navigate('/admin/brands', { replace: true });
          return;
        }

        setForm({
          id: target.id,
          brand_name: target.brand_name || '',
        });
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải dữ liệu nhãn hàng.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [editId, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.brand_name.trim()) {
      toast.error('Vui lòng nhập tên nhãn hàng.');
      return;
    }

    try {
      setSaving(true);

      if (form.id) {
        await updateBrand(form.id, {
          brand_name: form.brand_name.trim(),
        });
        toast.success('Cập nhật nhãn hàng thành công.');
      } else {
        await createBrand({
          brand_name: form.brand_name.trim(),
        });
        toast.success('Tạo nhãn hàng thành công.');
      }

      navigate('/admin/brands');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu nhãn hàng.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title={editId ? 'Sửa Nhãn hàng' : 'Thêm Nhãn hàng'}>
        <section className="admin-panel">
          <div className="admin-loading">Đang tải dữ liệu...</div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={editId ? 'Sửa Nhãn hàng' : 'Thêm Nhãn hàng'}>
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>{editId ? 'Cập nhật nhãn hàng' : 'Thêm nhãn hàng mới'}</h2>
            <p>Nhập thông tin nhãn hàng. Trường Logo URL đã được loại bỏ theo yêu cầu.</p>
          </div>
        </div>

        <article className="admin-sub-panel">
          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Tên nhãn hàng
              <input
                type="text"
                value={form.brand_name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, brand_name: event.target.value }))
                }
                required
              />
            </label>

            <div className="admin-form-actions admin-form-grid__full">
              <button type="button" onClick={() => navigate('/admin/brands')}>
                Quay lại danh sách
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : form.id ? 'Lưu cập nhật' : 'Thêm nhãn hàng'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminBrandCreate;