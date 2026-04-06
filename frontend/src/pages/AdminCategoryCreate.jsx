import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  createCategory,
  getCategories,
  updateCategory,
} from '../services/catalogService.js';

function AdminCategoryCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = Number(searchParams.get('edit') || 0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id: null,
    category_name: '',
    description: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        if (!editId) {
          return;
        }

        const response = await getCategories();
        const categories = response?.data || [];
        const target = categories.find((item) => Number(item.id) === editId);

        if (!target) {
          toast.error('Không tìm thấy danh mục cần sửa.');
          navigate('/admin/categories', { replace: true });
          return;
        }

        setForm({
          id: target.id,
          category_name: target.category_name || '',
          description: target.description || '',
        });
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải dữ liệu danh mục.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [editId, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.category_name.trim()) {
      toast.error('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        category_name: form.category_name.trim(),
        description: form.description.trim(),
      };

      if (form.id) {
        await updateCategory(form.id, payload);
        toast.success('Cập nhật danh mục thành công.');
      } else {
        await createCategory(payload);
        toast.success('Tạo danh mục thành công.');
      }

      navigate('/admin/categories');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu danh mục.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title={editId ? 'Sửa Danh mục' : 'Thêm Danh mục'}>
        <section className="admin-panel">
          <div className="admin-loading">Đang tải dữ liệu...</div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={editId ? 'Sửa Danh mục' : 'Thêm Danh mục'}>
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>{editId ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h2>
            <p>Nhập thông tin danh mục để dùng cho lọc và tổ chức sản phẩm.</p>
          </div>
        </div>

        <article className="admin-sub-panel">
          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Tên danh mục
              <input
                type="text"
                value={form.category_name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category_name: event.target.value }))
                }
                required
              />
            </label>

            <label className="admin-form-grid__full">
              Mô tả
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>

            <div className="admin-form-actions admin-form-grid__full">
              <button type="button" onClick={() => navigate('/admin/categories')}>
                Quay lại danh sách
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : form.id ? 'Lưu cập nhật' : 'Thêm danh mục'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminCategoryCreate;