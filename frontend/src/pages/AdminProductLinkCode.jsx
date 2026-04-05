import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  createProductGroup,
  deleteProductGroup,
  getAllProducts,
  getProductMasterData,
  getProductGroups,
  updateProductGroup,
  updateProductGroupStatus,
} from '../services/productService.js';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function AdminProductLinkCode() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [masterData, setMasterData] = useState({
    brands: [],
    categories: [],
  });
  const [groups, setGroups] = useState([]);
  const [skuCountByGroup, setSkuCountByGroup] = useState({});
  const [filters, setFilters] = useState({
    keyword: '',
    brandId: 'all',
    categoryId: 'all',
    status: 'all',
  });
  const [form, setForm] = useState({
    brand_id: '',
    category_id: '',
    link_code: '',
    description: '',
    warranty_months: 24,
    is_featured: 0,
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  function resetForm() {
    setForm({
      brand_id: '',
      category_id: '',
      link_code: '',
      description: '',
      warranty_months: 24,
      is_featured: 0,
    });
    setEditingId(null);
  }

  async function loadData() {
    try {
      setLoading(true);

      const [masterResponse, groupsResponse, productsResponse] = await Promise.all([
        getProductMasterData(),
        getProductGroups(),
        getAllProducts(),
      ]);

      const brands = masterResponse?.data?.brands || [];
      const categories = masterResponse?.data?.categories || [];
      const fetchedGroups = groupsResponse?.data || [];
      const allProducts = Array.isArray(productsResponse?.data)
        ? productsResponse.data
        : productsResponse?.data?.items || [];

      const counter = allProducts.reduce((acc, item) => {
        const key = Number(item.group_id || 0);
        if (!key) {
          return acc;
        }

        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setMasterData({ brands, categories });
      setGroups(fetchedGroups);
      setSkuCountByGroup(counter);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải dữ liệu mã liên kết.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const hitKeyword =
        !filters.keyword ||
        normalizeText(group.group_name).includes(normalizeText(filters.keyword));
      const hitBrand =
        filters.brandId === 'all' || Number(group.brand_id) === Number(filters.brandId);
      const hitCategory =
        filters.categoryId === 'all' || Number(group.category_id) === Number(filters.categoryId);
      const hitStatus =
        filters.status === 'all' ||
        (filters.status === 'active'
          ? Number(group.is_active) === 1
          : Number(group.is_active) === 0);

      return hitKeyword && hitBrand && hitCategory && hitStatus;
    });
  }, [groups, filters]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.brand_id || !form.category_id || !form.link_code.trim()) {
      toast.error('Vui lòng nhập đủ Hãng, Danh mục và Mã liên kết.');
      return;
    }

    const duplicated = groups.some(
      (group) =>
        Number(group.id) !== Number(editingId || 0) &&
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

      if (editingId) {
        await updateProductGroup(editingId, {
          brand_id: Number(form.brand_id),
          category_id: Number(form.category_id),
          group_name: form.link_code.trim(),
          short_description: form.link_code.trim(),
          description: form.description.trim(),
          warranty_months: Number(form.warranty_months || 12),
          is_featured: Number(form.is_featured) ? 1 : 0,
        });
        toast.success('Cập nhật mã liên kết thành công.');
      } else {
        await createProductGroup({
          brand_id: Number(form.brand_id),
          category_id: Number(form.category_id),
          group_name: form.link_code.trim(),
          short_description: form.link_code.trim(),
          description: form.description.trim(),
          warranty_months: Number(form.warranty_months || 12),
          is_featured: Number(form.is_featured) ? 1 : 0,
        });
        toast.success('Tạo mã liên kết thành công.');
      }

      resetForm();

      await loadData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo mã liên kết.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      brand_id: String(item.brand_id || ''),
      category_id: String(item.category_id || ''),
      link_code: item.group_name || '',
      description: item.description || '',
      warranty_months: Number(item.warranty_months || 12),
      is_featured: Number(item.is_featured) ? 1 : 0,
    });
  }

  async function handleToggleStatus(item) {
    const nextStatus = Number(item.is_active) ? 0 : 1;

    try {
      setActioningId(item.id);
      await updateProductGroupStatus(item.id, nextStatus);
      setGroups((prev) =>
        prev.map((group) =>
          group.id === item.id ? { ...group, is_active: nextStatus } : group
        )
      );
      toast.success('Đã cập nhật trạng thái mã liên kết.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể đổi trạng thái mã liên kết.';
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setActioningId(deleteTarget.id);
      await deleteProductGroup(deleteTarget.id);
      toast.success('Đã xóa mã liên kết.');
      setDeleteTarget(null);
      if (Number(editingId) === Number(deleteTarget.id)) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa mã liên kết.';
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý Mã liên kết">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Quản lý mã liên kết sản phẩm</h2>
            <p>
              Mỗi mã liên kết đại diện cho một model (ví dụ: LOQ 2024) để gom nhiều SKU thành
              các tùy chọn cấu hình trong trang chi tiết.
            </p>
          </div>
        </div>

        <div className="admin-grid-two">
          <article className="admin-sub-panel">
            <h3>{editingId ? 'Cập nhật mã liên kết' : 'Tạo mã liên kết mới'}</h3>

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

              <label>
                Nổi bật
                <select
                  value={form.is_featured}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, is_featured: event.target.value }))
                  }
                >
                  <option value={0}>Không</option>
                  <option value={1}>Có</option>
                </select>
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
                {editingId ? (
                  <button type="button" onClick={resetForm}>
                    Hủy sửa
                  </button>
                ) : (
                  <button type="button" onClick={resetForm}>
                    Làm mới
                  </button>
                )}
                <button type="submit" disabled={saving}>
                  {saving
                    ? 'Đang lưu...'
                    : editingId
                      ? 'Lưu cập nhật'
                      : 'Tạo mã liên kết'}
                </button>
              </div>
            </form>
          </article>

          <article className="admin-sub-panel">
            <h3>Danh sách mã liên kết</h3>

            <div className="admin-filter-row">
              <label>
                Từ khóa
                <input
                  type="search"
                  value={filters.keyword}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, keyword: event.target.value }))
                  }
                  placeholder="Nhập mã liên kết..."
                />
              </label>

              <label>
                Hãng
                <select
                  value={filters.brandId}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, brandId: event.target.value }))
                  }
                >
                  <option value="all">Tất cả</option>
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
                  value={filters.categoryId}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, categoryId: event.target.value }))
                  }
                >
                  <option value="all">Tất cả</option>
                  {masterData.categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.category_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Trạng thái
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang kích hoạt</option>
                  <option value="inactive">Đang khóa</option>
                </select>
              </label>
            </div>

            {loading ? (
              <div className="admin-loading">Đang tải dữ liệu mã liên kết...</div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mã liên kết</th>
                      <th>Hãng</th>
                      <th>Danh mục</th>
                      <th>Trạng thái</th>
                      <th>Bảo hành</th>
                      <th>Nổi bật</th>
                      <th>Số SKU</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="admin-empty">
                          Chưa có mã liên kết nào.
                        </td>
                      </tr>
                    ) : (
                      filteredGroups.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.group_name}</td>
                          <td>{item.brand_name}</td>
                          <td>{item.category_name}</td>
                          <td>{Number(item.is_active) ? 'Đang kích hoạt' : 'Đang khóa'}</td>
                          <td>{item.warranty_months || 12} tháng</td>
                          <td>{Number(item.is_featured) ? 'Có' : 'Không'}</td>
                          <td>{skuCountByGroup[item.id] || 0}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn--edit"
                                onClick={() => handleEdit(item)}
                                disabled={actioningId === item.id}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--view"
                                onClick={() => handleToggleStatus(item)}
                                disabled={actioningId === item.id}
                              >
                                {Number(item.is_active) ? 'Khóa' : 'Mở'}
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--delete"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: item.id,
                                    group_name: item.group_name,
                                  })
                                }
                                disabled={actioningId === item.id}
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>
      </section>

      {deleteTarget ? (
        <div className="admin-modal-overlay" role="presentation">
          <article className="admin-modal admin-confirm-modal">
            <header>
              <h3>Xác nhận xóa mã liên kết</h3>
            </header>

            <div className="admin-confirm-body">
              <p>
                Bạn có chắc muốn xóa mã liên kết
                {' '}
                <strong>{deleteTarget.group_name}</strong>
                ?
              </p>

              <div className="admin-form-actions">
                <button type="button" onClick={() => setDeleteTarget(null)}>
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actioningId === deleteTarget.id}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </AdminLayout>
  );
}

export default AdminProductLinkCode;
