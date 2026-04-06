import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  createCategory,
  deleteCategory,
  getCategories,
  toggleCategoryStatus,
  updateCategory,
} from '../services/catalogService.js';

function AdminCategoryList() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', status: 'all' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    category_name: '',
    description: '',
  });

  async function loadCategories() {
    try {
      setLoading(true);
      const response = await getCategories(filters);
      setCategories(response?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải danh sách danh mục.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, [filters]);

  function resetForm() {
    setCategoryForm({ id: null, category_name: '', description: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!categoryForm.category_name.trim()) {
      toast.error('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        category_name: categoryForm.category_name.trim(),
        description: categoryForm.description.trim(),
      };

      if (categoryForm.id) {
        await updateCategory(categoryForm.id, payload);
        toast.success('Cập nhật danh mục thành công.');
      } else {
        await createCategory(payload);
        toast.success('Tạo danh mục thành công.');
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu danh mục.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    try {
      await toggleCategoryStatus(item.id, item.is_active ? 0 : 1);
      await loadCategories();
      toast.success('Đã cập nhật trạng thái danh mục.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật trạng thái danh mục.';
      toast.error(message);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteCategory(deleteTarget.id);
      toast.success('Đã xóa danh mục.');
      setDeleteTarget(null);
      await loadCategories();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa danh mục.';
      toast.error(message);
    }
  }

  return (
    <AdminLayout title="Danh sách Danh mục">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Quản lý danh mục</h2>
            <p>Thêm/sửa ở phần trên và xem danh sách ở phần dưới cùng một trang.</p>
          </div>
        </div>

        <article className="admin-sub-panel">
          <h3>{categoryForm.id ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h3>

          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Tên danh mục
              <input
                type="text"
                value={categoryForm.category_name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, category_name: event.target.value }))
                }
                required
              />
            </label>

            <label className="admin-form-grid__full">
              Mô tả
              <textarea
                rows={3}
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </label>

            <div className="admin-form-actions admin-form-grid__full">
              <button type="button" onClick={resetForm}>
                {categoryForm.id ? 'Hủy sửa' : 'Làm mới'}
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : categoryForm.id ? 'Lưu cập nhật' : 'Thêm danh mục'}
              </button>
            </div>
          </form>

          <h3 style={{ marginTop: 18 }}>Danh sách danh mục</h3>

          <div className="admin-filter-row">
            <label>
              Tìm kiếm
              <input
                type="search"
                value={filters.keyword}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, keyword: event.target.value }))
                }
                placeholder="Tên danh mục..."
              />
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
            <div className="admin-loading">Đang tải danh mục...</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>
                    <th>Slug</th>
                    <th>Số sản phẩm</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-empty">
                        Không có dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    categories.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.category_name}</td>
                        <td>{item.slug}</td>
                        <td>{Number(item.product_count || 0)}</td>
                        <td>{item.is_active ? 'Đang kích hoạt' : 'Đang khóa'}</td>
                        <td>
                          <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn--edit"
                                onClick={() =>
                                  setCategoryForm({
                                    id: item.id,
                                    category_name: item.category_name || '',
                                    description: item.description || '',
                                  })
                                }
                              >
                                Edit
                              </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn--view"
                              onClick={() => handleToggle(item)}
                            >
                              {item.is_active ? 'Khóa' : 'Mở'}
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn--delete"
                              onClick={() =>
                                setDeleteTarget({
                                  id: item.id,
                                  name: item.category_name,
                                })
                              }
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
      </section>

      {deleteTarget ? (
        <div className="admin-modal-overlay" role="presentation">
          <article className="admin-modal admin-confirm-modal">
            <header>
              <h3>Xác nhận xóa</h3>
            </header>
            <div className="admin-confirm-body">
              <p>
                Bạn có chắc muốn xóa
                {' '}
                <strong>{deleteTarget.name}</strong>
                {' '}?
              </p>
              <div className="admin-form-actions">
                <button type="button" onClick={() => setDeleteTarget(null)}>
                  Hủy
                </button>
                <button type="button" onClick={handleConfirmDelete}>
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

export default AdminCategoryList;