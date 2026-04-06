import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  createProductGroup,
  getProductMasterData,
  getProductGroups,
  updateProductGroup,
} from '../services/productService.js';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function AdminProductLinkCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = Number(searchParams.get('edit') || 0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [masterData, setMasterData] = useState({
    brands: [],
    categories: [],
  });
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    brand_id: '',
    category_id: '',
    link_code: '',
    description: '',
    warranty_months: 24,
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [masterResponse, groupsResponse] = await Promise.all([
          getProductMasterData(),
          getProductGroups(),
        ]);

        const brands = masterResponse?.data?.brands || [];
        const categories = masterResponse?.data?.categories || [];
        const fetchedGroups = groupsResponse?.data || [];

        setMasterData({ brands, categories });
        setGroups(fetchedGroups);

        if (editId) {
          const target = fetchedGroups.find((group) => Number(group.id) === editId);
          if (!target) {
            toast.error('Không tìm thấy mã liên kết cần sửa.');
            navigate('/admin/product-links', { replace: true });
            return;
          }

          setForm({
            brand_id: String(target.brand_id || ''),
            category_id: String(target.category_id || ''),
            link_code: target.group_name || '',
            description: target.description || '',
            warranty_months: Number(target.warranty_months || 12),
          });
        }
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể tải dữ liệu mã liên kết.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [editId, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.brand_id || !form.category_id || !form.link_code.trim()) {
      toast.error('Vui lòng nhập đủ Hãng, Danh mục và Mã liên kết.');
      return;
    }

    const duplicated = groups.some(
      (group) =>
        Number(group.id) !== Number(editId || 0) &&
        Number(group.brand_id) === Number(form.brand_id) &&
        Number(group.category_id) === Number(form.category_id) &&
        normalizeText(group.group_name) === normalizeText(form.link_code)
    );

    if (duplicated) {
      toast.error('Mã liên kết đã tồn tại trong cùng hãng và danh mục.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        brand_id: Number(form.brand_id),
        category_id: Number(form.category_id),
        group_name: form.link_code.trim(),
        short_description: form.link_code.trim(),
        description: form.description.trim(),
        warranty_months: Number(form.warranty_months || 12),
      };

      if (editId) {
        await updateProductGroup(editId, payload);
        toast.success('Cập nhật mã liên kết thành công.');
      } else {
        await createProductGroup(payload);
        toast.success('Tạo mã liên kết thành công.');
      }

      navigate('/admin/product-links');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu mã liên kết.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title={editId ? 'Cập nhật Mã liên kết' : 'Tạo Mã liên kết'}>
        <section className="admin-panel">
          <div className="admin-loading">Đang tải dữ liệu mã liên kết...</div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={editId ? 'Cập nhật Mã liên kết' : 'Tạo Mã liên kết'}>
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>{editId ? 'Cập nhật mã liên kết' : 'Tạo mã liên kết mới'}</h2>
            <p>Mã liên kết dùng để gom nhiều SKU cùng model trên trang chi tiết sản phẩm.</p>
          </div>
        </div>

        <article className="admin-sub-panel">
          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Hãng
              <select
                value={form.brand_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, brand_id: event.target.value }))
                }
                required
              >
                <option value="">-- Chọn hãng --</option>
                {masterData.brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.brand_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Danh mục
              <select
                value={form.category_id}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, category_id: event.target.value }))
                }
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {masterData.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.category_name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-grid__full">
              Mã liên kết
              <input
                type="text"
                value={form.link_code}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, link_code: event.target.value }))
                }
                placeholder="Ví dụ: LOQ 2024"
                required
              />
            </label>

            <label>
              Bảo hành (tháng)
              <input
                type="number"
                min="1"
                value={form.warranty_months}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, warranty_months: event.target.value }))
                }
              />
            </label>

            <label className="admin-form-grid__full">
              Mô tả
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>

            <div className="admin-form-actions admin-form-grid__full">
              <button type="button" onClick={() => navigate('/admin/product-links')}>
                Quay lại danh sách
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : editId ? 'Lưu cập nhật' : 'Tạo mã liên kết'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </AdminLayout>
  );
}

export default AdminProductLinkCreate;