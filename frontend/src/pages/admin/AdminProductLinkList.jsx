import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  deleteProductGroup,
  getAllProducts,
  getProductMasterData,
  getProductGroups,
  updateProductGroupStatus,
} from '../../services/productService.js';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function AdminProductLinkList() {
  const [loading, setLoading] = useState(true);
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
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      await loadData();
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xóa mã liên kết.';
      toast.error(message);
    } finally {
      setActioningId(null);
    }
  }

  return (
    <AdminLayout title="Danh sách Mã liên kết">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Danh sách mã liên kết sản phẩm</h2>
            <p>Quản lý các mã liên kết dùng để gom SKU theo model sản phẩm.</p>
          </div>
          <Link to="/admin/product-links/create" className="admin-primary-link">
            Tạo mã liên kết
          </Link>
        </div>

        <article className="admin-sub-panel">
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
                    <th>Số SKU</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="admin-empty">
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
                        <td>{skuCountByGroup[item.id] || 0}</td>
                        <td>
                          <div className="admin-actions">
                            <Link
                              to={`/admin/product-links/create?edit=${item.id}`}
                              className="admin-btn admin-btn--edit"
                            >
                              Edit
                            </Link>
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

export default AdminProductLinkList;
