import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createBrand,
  deleteBrand,
  getBrands,
  toggleBrandStatus,
  updateBrand,
} from '../../services/catalogService.js';

function AdminBrandList() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({ keyword: '', status: 'all' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [brandForm, setBrandForm] = useState({
    id: null,
    brand_name: '',
  });

  async function loadBrands() {
    try {
      setLoading(true);
      const response = await getBrands(filters);
      setBrands(response?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải danh sách nhãn hàng.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, [filters]);

  function resetForm() {
    setBrandForm({ id: null, brand_name: '' });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!brandForm.brand_name.trim()) {
      toast.error('Vui lòng nhập tên nhãn hàng.');
      return;
    }

    try {
      setSaving(true);

      if (brandForm.id) {
        await updateBrand(brandForm.id, {
          brand_name: brandForm.brand_name.trim(),
        });
        toast.success('Cập nhật nhãn hàng thành công.');
      } else {
        await createBrand({
          brand_name: brandForm.brand_name.trim(),
        });
        toast.success('Tạo nhãn hàng thành công.');
      }

      resetForm();
      await loadBrands();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu nhãn hàng.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    try {
      await toggleBrandStatus(item.id, item.is_active ? 0 : 1);
      await loadBrands();
      toast.success('Đã cập nhật trạng thái nhãn hàng.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật trạng thái nhãn hàng.';
      toast.error(message);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteBrand(deleteTarget.id);
      toast.success('Đã xóa nhãn hàng.');
      setDeleteTarget(null);
      await loadBrands();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa nhãn hàng.';
      toast.error(message);
    }
  }

  return (
    <AdminLayout title="Danh sách Nhãn hàng">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Quản lý nhãn hàng</h2>
            <p>Thêm/sửa ở phần trên và xem danh sách ở phần dưới cùng một trang.</p>
          </div>
        </div>

        <article className="admin-sub-panel">
          <h3>{brandForm.id ? 'Cập nhật nhãn hàng' : 'Thêm nhãn hàng mới'}</h3>

          <form className="admin-form-grid" onSubmit={handleSubmit}>
            <label>
              Tên nhãn hàng
              <input
                type="text"
                value={brandForm.brand_name}
                onChange={(event) =>
                  setBrandForm((prev) => ({ ...prev, brand_name: event.target.value }))
                }
                required
              />
            </label>

            <div className="admin-form-actions admin-form-grid__full">
              <button type="button" onClick={resetForm}>
                {brandForm.id ? 'Hủy sửa' : 'Làm mới'}
              </button>
              <button type="submit" disabled={saving}>
                {saving ? 'Đang lưu...' : brandForm.id ? 'Lưu cập nhật' : 'Thêm nhãn hàng'}
              </button>
            </div>
          </form>

          <h3 style={{ marginTop: 18 }}>Danh sách nhãn hàng</h3>

          <div className="admin-filter-row">
            <label>
              Tìm kiếm
              <input
                type="search"
                value={filters.keyword}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, keyword: event.target.value }))
                }
                placeholder="Tên nhãn hàng..."
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
            <div className="admin-loading">Đang tải nhãn hàng...</div>
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
                  {brands.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-empty">
                        Không có dữ liệu.
                      </td>
                    </tr>
                  ) : (
                    brands.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>{item.brand_name}</td>
                        <td>{item.slug}</td>
                        <td>{Number(item.product_count || 0)}</td>
                        <td>{item.is_active ? 'Đang kích hoạt' : 'Đang khóa'}</td>
                        <td>
                          <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn--edit"
                                onClick={() =>
                                  setBrandForm({
                                    id: item.id,
                                    brand_name: item.brand_name || '',
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
                                  name: item.brand_name,
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

export default AdminBrandList;
