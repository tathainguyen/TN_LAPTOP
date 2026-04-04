import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  getBrands,
  getCategories,
  toggleBrandStatus,
  toggleCategoryStatus,
  updateBrand,
  updateCategory,
} from '../services/catalogService.js';

function AdminCatalogBrand() {
  const [loading, setLoading] = useState(true);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [brandFilters, setBrandFilters] = useState({ keyword: '', status: 'all' });
  const [categoryFilters, setCategoryFilters] = useState({ keyword: '', status: 'all' });

  const [brandForm, setBrandForm] = useState({
    id: null,
    brand_name: '',
    logo_url: '',
  });

  const [categoryForm, setCategoryForm] = useState({
    id: null,
    category_name: '',
    description: '',
  });
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadAllData() {
    try {
      setLoading(true);

      const [brandResponse, categoryResponse] = await Promise.all([
        getBrands(brandFilters),
        getCategories(categoryFilters),
      ]);

      setBrands(brandResponse?.data || []);
      setCategories(categoryResponse?.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tải danh mục và nhãn hàng.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, [brandFilters, categoryFilters]);

  function resetBrandForm() {
    setBrandForm({ id: null, brand_name: '', logo_url: '' });
  }

  function resetCategoryForm() {
    setCategoryForm({ id: null, category_name: '', description: '' });
  }

  async function handleSubmitBrand(event) {
    event.preventDefault();

    if (!brandForm.brand_name.trim()) {
      toast.error('Vui lòng nhập tên nhãn hàng.');
      return;
    }

    try {
      setSavingBrand(true);

      if (brandForm.id) {
        await updateBrand(brandForm.id, {
          brand_name: brandForm.brand_name.trim(),
          logo_url: brandForm.logo_url.trim(),
        });
        toast.success('Cập nhật nhãn hàng thành công.');
      } else {
        await createBrand({
          brand_name: brandForm.brand_name.trim(),
          logo_url: brandForm.logo_url.trim(),
        });
        toast.success('Tạo nhãn hàng thành công.');
      }

      resetBrandForm();
      await loadAllData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu nhãn hàng.';
      toast.error(message);
    } finally {
      setSavingBrand(false);
    }
  }

  async function handleSubmitCategory(event) {
    event.preventDefault();

    if (!categoryForm.category_name.trim()) {
      toast.error('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      setSavingCategory(true);

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

      resetCategoryForm();
      await loadAllData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lưu danh mục.';
      toast.error(message);
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleToggleBrand(item) {
    try {
      await toggleBrandStatus(item.id, item.is_active ? 0 : 1);
      await loadAllData();
      toast.success('Đã cập nhật trạng thái nhãn hàng.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật trạng thái nhãn hàng.';
      toast.error(message);
    }
  }

  async function handleToggleCategory(item) {
    try {
      await toggleCategoryStatus(item.id, item.is_active ? 0 : 1);
      await loadAllData();
      toast.success('Đã cập nhật trạng thái danh mục.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật trạng thái danh mục.';
      toast.error(message);
    }
  }

  function handleEditBrand(item) {
    setBrandForm({
      id: item.id,
      brand_name: item.brand_name || '',
      logo_url: item.logo_url || '',
    });
  }

  function handleEditCategory(item) {
    setCategoryForm({
      id: item.id,
      category_name: item.category_name || '',
      description: item.description || '',
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      if (deleteTarget.type === 'brand') {
        await deleteBrand(deleteTarget.id);
        toast.success('Đã xóa nhãn hàng.');
      } else {
        await deleteCategory(deleteTarget.id);
        toast.success('Đã xóa danh mục.');
      }

      setDeleteTarget(null);
      resetBrandForm();
      resetCategoryForm();
      await loadAllData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa dữ liệu.';
      toast.error(message);
    }
  }

  return (
    <AdminLayout title="Quản lý Danh mục & Nhãn hàng">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Danh mục & Nhãn hàng</h2>
            <p>Thêm, cập nhật và khóa/mở dữ liệu nền cho toàn bộ hệ thống sản phẩm.</p>
          </div>
        </div>

        <div className="admin-grid-two">
          <article className="admin-sub-panel">
            <h3>Nhãn hàng</h3>

            <form className="admin-form-grid" onSubmit={handleSubmitBrand}>
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

              <label>
                Logo URL
                <input
                  type="text"
                  value={brandForm.logo_url}
                  onChange={(event) =>
                    setBrandForm((prev) => ({ ...prev, logo_url: event.target.value }))
                  }
                />
              </label>

              <div className="admin-form-actions admin-form-grid__full">
                {brandForm.id ? (
                  <button type="button" onClick={resetBrandForm}>
                    Hủy sửa
                  </button>
                ) : null}
                <button type="submit" disabled={savingBrand}>
                  {savingBrand
                    ? 'Đang lưu...'
                    : brandForm.id
                      ? 'Cập nhật nhãn hàng'
                      : 'Thêm nhãn hàng'}
                </button>
              </div>
            </form>

            <div className="admin-filter-row">
              <label>
                Tìm kiếm
                <input
                  type="search"
                  value={brandFilters.keyword}
                  onChange={(event) =>
                    setBrandFilters((prev) => ({ ...prev, keyword: event.target.value }))
                  }
                  placeholder="Tên nhãn hàng..."
                />
              </label>

              <label>
                Trạng thái
                <select
                  value={brandFilters.status}
                  onChange={(event) =>
                    setBrandFilters((prev) => ({ ...prev, status: event.target.value }))
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
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-empty">
                          Không có dữ liệu.
                        </td>
                      </tr>
                    ) : (
                      brands.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.brand_name}</td>
                          <td>{item.slug}</td>
                          <td>{item.is_active ? 'Đang kích hoạt' : 'Đang khóa'}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn--edit"
                                onClick={() => handleEditBrand(item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--view"
                                onClick={() => handleToggleBrand(item)}
                              >
                                {item.is_active ? 'Khóa' : 'Mở'}
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--delete"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: item.id,
                                    type: 'brand',
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

          <article className="admin-sub-panel">
            <h3>Danh mục</h3>

            <form className="admin-form-grid" onSubmit={handleSubmitCategory}>
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
                {categoryForm.id ? (
                  <button type="button" onClick={resetCategoryForm}>
                    Hủy sửa
                  </button>
                ) : null}
                <button type="submit" disabled={savingCategory}>
                  {savingCategory
                    ? 'Đang lưu...'
                    : categoryForm.id
                      ? 'Cập nhật danh mục'
                      : 'Thêm danh mục'}
                </button>
              </div>
            </form>

            <div className="admin-filter-row">
              <label>
                Tìm kiếm
                <input
                  type="search"
                  value={categoryFilters.keyword}
                  onChange={(event) =>
                    setCategoryFilters((prev) => ({ ...prev, keyword: event.target.value }))
                  }
                  placeholder="Tên danh mục..."
                />
              </label>

              <label>
                Trạng thái
                <select
                  value={categoryFilters.status}
                  onChange={(event) =>
                    setCategoryFilters((prev) => ({ ...prev, status: event.target.value }))
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
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="admin-empty">
                          Không có dữ liệu.
                        </td>
                      </tr>
                    ) : (
                      categories.map((item) => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.category_name}</td>
                          <td>{item.slug}</td>
                          <td>{item.is_active ? 'Đang kích hoạt' : 'Đang khóa'}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn--edit"
                                onClick={() => handleEditCategory(item)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--view"
                                onClick={() => handleToggleCategory(item)}
                              >
                                {item.is_active ? 'Khóa' : 'Mở'}
                              </button>
                              <button
                                type="button"
                                className="admin-btn admin-btn--delete"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: item.id,
                                    type: 'category',
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
        </div>
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

export default AdminCatalogBrand;
