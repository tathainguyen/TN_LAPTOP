import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductMasterData,
  updateProduct,
  updateProductStatus,
} from '../services/productService.js';

const LIMIT = 10;

function formatVnd(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function inferSegment(categoryName) {
  if (!categoryName) {
    return 'Chung';
  }

  const text = String(categoryName).toLowerCase();
  if (text.includes('gaming')) {
    return 'Gaming';
  }
  if (text.includes('văn phòng') || text.includes('van phong')) {
    return 'Văn phòng';
  }
  if (text.includes('đồ họa') || text.includes('do hoa') || text.includes('thiết kế')) {
    return 'Đồ họa - Thiết kế';
  }

  return categoryName;
}

function AdminProductList() {
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [filters, setFilters] = useState({
    brandId: 'all',
    categoryId: 'all',
    keyword: '',
  });
  const [masterData, setMasterData] = useState({
    brands: [],
    categories: [],
    groups: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    group_id: '',
    product_name: '',
    sku: '',
    cpu_option: '',
    ram_option: '',
    storage_option: '',
    vga_option: '',
    color_option: '',
    price_sale: '',
    price_compare: '',
    stock_quantity: '',
    is_active: 1,
    image_urls_text: '',
  });

  useEffect(() => {
    async function loadMasterData() {
      try {
        const response = await getProductMasterData();

        const brands = response?.data?.brands || [];
        const categories = response?.data?.categories || [];
        const groups = response?.data?.groups || [];

        if (brands.length === 0 && categories.length === 0) {
          const fallback = await getAllProducts();
          const all = Array.isArray(fallback?.data)
            ? fallback.data
            : fallback?.data?.items || [];

          const dedupBrands = [];
          const dedupCategories = [];
          const dedupGroups = [];
          const brandSet = new Set();
          const categorySet = new Set();
          const groupSet = new Set();

          all.forEach((item) => {
            if (item.brand_id && !brandSet.has(item.brand_id)) {
              brandSet.add(item.brand_id);
              dedupBrands.push({ id: item.brand_id, brand_name: item.brand_name });
            }

            if (item.category_id && !categorySet.has(item.category_id)) {
              categorySet.add(item.category_id);
              dedupCategories.push({ id: item.category_id, category_name: item.category_name });
            }

            if (item.group_id && !groupSet.has(item.group_id)) {
              groupSet.add(item.group_id);
              dedupGroups.push({
                id: item.group_id,
                group_name: item.group_name,
                brand_name: item.brand_name,
                category_name: item.category_name,
              });
            }
          });

          setMasterData({
            brands: dedupBrands,
            categories: dedupCategories,
            groups: dedupGroups,
          });

          return;
        }

        setMasterData({
          brands,
          categories,
          groups,
        });
      } catch (error) {
        try {
          const fallback = await getAllProducts();
          const all = Array.isArray(fallback?.data)
            ? fallback.data
            : fallback?.data?.items || [];

          const dedupBrands = [];
          const dedupCategories = [];
          const dedupGroups = [];
          const brandSet = new Set();
          const categorySet = new Set();
          const groupSet = new Set();

          all.forEach((item) => {
            if (item.brand_id && !brandSet.has(item.brand_id)) {
              brandSet.add(item.brand_id);
              dedupBrands.push({ id: item.brand_id, brand_name: item.brand_name });
            }

            if (item.category_id && !categorySet.has(item.category_id)) {
              categorySet.add(item.category_id);
              dedupCategories.push({ id: item.category_id, category_name: item.category_name });
            }

            if (item.group_id && !groupSet.has(item.group_id)) {
              groupSet.add(item.group_id);
              dedupGroups.push({
                id: item.group_id,
                group_name: item.group_name,
                brand_name: item.brand_name,
                category_name: item.category_name,
              });
            }
          });

          setMasterData({
            brands: dedupBrands,
            categories: dedupCategories,
            groups: dedupGroups,
          });
          toast('Đang dùng dữ liệu lọc tạm từ danh sách SKU.', { icon: 'ℹ️' });
        } catch {
          const message = error?.response?.data?.message || 'Không thể tải danh mục lọc.';
          toast.error(message);
        }
      }
    }

    loadMasterData();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const response = await getAllProducts({
          page: pagination.page,
          limit: pagination.limit,
          brandId: filters.brandId === 'all' ? undefined : Number(filters.brandId),
          categoryId:
            filters.categoryId === 'all' ? undefined : Number(filters.categoryId),
          keyword: filters.keyword || undefined,
        });

        const payload = response?.data;

        if (Array.isArray(payload)) {
          setProducts(payload);
          setPagination((prev) => ({
            ...prev,
            total: payload.length,
            totalPages: 1,
          }));
          return;
        }

        setProducts(payload?.items || []);
        setPagination((prev) => ({
          ...prev,
          total: payload?.pagination?.total || 0,
          totalPages: payload?.pagination?.totalPages || 1,
        }));
      } catch (error) {
        const message =
          error?.response?.data?.message || 'Không thể tải danh sách sản phẩm.';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [filters, pagination.page, pagination.limit]);

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function applyKeywordSearch() {
    setFilters((prev) => ({
      ...prev,
      keyword: keywordInput.trim(),
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === pagination.page) {
      return;
    }

    setPagination((prev) => ({ ...prev, page: nextPage }));
  }

  async function handleToggleStatus(item) {
    const nextStatus = item.is_active ? 0 : 1;

    try {
      setSubmittingId(item.id);
      await updateProductStatus(item.id, nextStatus);
      setProducts((prev) =>
        prev.map((product) =>
          product.id === item.id ? { ...product, is_active: nextStatus } : product
        )
      );
      toast.success('Đã cập nhật trạng thái sản phẩm.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể đổi trạng thái sản phẩm.';
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setSubmittingId(deleteTarget.id);
      await deleteProduct(deleteTarget.id);
      toast.success('Đã xoá SKU.');
      setDeleteTarget(null);

      if (products.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        setProducts((prev) => prev.filter((product) => product.id !== deleteTarget.id));
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể xoá sản phẩm.';
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  }

  async function handleView(item) {
    try {
      const response = await getProductById(item.id);
      setViewItem(response?.data || item);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể lấy chi tiết sản phẩm.';
      toast.error(message);
    }
  }

  async function handleOpenEdit(item) {
    try {
      const response = await getProductById(item.id);
      const detail = response?.data;
      if (!detail) {
        toast.error('Không tìm thấy sản phẩm.');
        return;
      }

      setEditItem(detail);
      setEditForm({
        group_id: String(detail.group_id || ''),
        product_name: detail.product_name || '',
        sku: detail.sku || '',
        cpu_option: detail.cpu_option || '',
        ram_option: detail.ram_option || '',
        storage_option: detail.storage_option || '',
        vga_option: detail.vga_option || '',
        color_option: detail.color_option || '',
        price_sale: String(detail.price_sale || ''),
        price_compare:
          detail.price_compare !== null && detail.price_compare !== undefined
            ? String(detail.price_compare)
            : '',
        stock_quantity: String(detail.stock_quantity || 0),
        is_active: Number(detail.is_active) ? 1 : 0,
        image_urls_text: (detail.images || []).map((img) => img.image_url).join('\n'),
      });
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể mở form chỉnh sửa.';
      toast.error(message);
    }
  }

  async function handleSubmitEdit(event) {
    event.preventDefault();

    if (!editItem) {
      return;
    }

    const imageUrls = editForm.image_urls_text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const payload = {
      group_id: Number(editForm.group_id),
      product_name: editForm.product_name.trim(),
      sku: editForm.sku.trim(),
      cpu_option: editForm.cpu_option.trim(),
      ram_option: editForm.ram_option.trim(),
      storage_option: editForm.storage_option.trim(),
      vga_option: editForm.vga_option.trim(),
      color_option: editForm.color_option.trim(),
      price_sale: Number(editForm.price_sale || 0),
      price_compare: editForm.price_compare === '' ? null : Number(editForm.price_compare),
      stock_quantity: Number(editForm.stock_quantity || 0),
      is_active: Number(editForm.is_active) ? 1 : 0,
      image_urls: imageUrls,
    };

    if (!payload.group_id || !payload.product_name || !payload.sku || !payload.price_sale) {
      toast.error('Vui lòng nhập đủ Group, Tên SKU, Mã SKU và Giá bán.');
      return;
    }

    try {
      setSubmittingId(editItem.id);
      await updateProduct(editItem.id, payload);
      setEditItem(null);

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                group_id: payload.group_id,
                product_name: payload.product_name,
                sku: payload.sku,
                cpu_option: payload.cpu_option,
                ram_option: payload.ram_option,
                storage_option: payload.storage_option,
                vga_option: payload.vga_option,
                color_option: payload.color_option,
                price_sale: payload.price_sale,
                price_compare: payload.price_compare,
                stock_quantity: payload.stock_quantity,
                is_active: payload.is_active,
              }
            : item
        )
      );

      toast.success('Cập nhật SKU thành công.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể cập nhật SKU.';
      toast.error(message);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <AdminLayout title="Quản lý Sản phẩm (Master List)">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Danh sách tất cả phiên bản SKU</h2>
            <p>Lọc nhanh theo danh mục và hãng để quản trị tồn kho toàn hệ thống.</p>
          </div>

          <Link to="/admin/products/create" className="admin-primary-link">
            + Thêm sản phẩm mới
          </Link>
        </div>

        <div className="admin-filter-row">
          <label>
            Danh mục
            <select
              value={filters.categoryId}
              onChange={(event) => updateFilter('categoryId', event.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              {masterData.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Hãng
            <select
              value={filters.brandId}
              onChange={(event) => updateFilter('brandId', event.target.value)}
            >
              <option value="all">Tất cả hãng</option>
              {masterData.brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.brand_name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-filter-row__keyword">
            Từ khóa
            <div className="admin-search-inline">
              <input
                type="search"
                placeholder="Tìm theo tên SKU, mã SKU..."
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    applyKeywordSearch();
                  }
                }}
              />
              <button type="button" onClick={applyKeywordSearch}>
                Tìm
              </button>
            </div>
          </label>
        </div>

        {loading ? (
          <div className="admin-loading">Đang tải danh sách SKU...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Hãng</th>
                  <th>Phân khúc</th>
                  <th>Lượt xem</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="admin-empty">
                      Không có SKU phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  products.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>
                        <p className="admin-product-name">{item.product_name}</p>
                        <small>{item.sku}</small>
                      </td>
                      <td>{item.category_name}</td>
                      <td>{item.brand_name}</td>
                      <td>{inferSegment(item.category_name)}</td>
                      <td>{item.view_count || 0}</td>
                      <td>{item.stock_quantity}</td>
                      <td>
                        <button
                          type="button"
                          className={`admin-switch ${item.is_active ? 'on' : 'off'}`}
                          disabled={submittingId === item.id}
                          onClick={() => handleToggleStatus(item)}
                          aria-label="Toggle trạng thái bán"
                        >
                          <span />
                        </button>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn--view"
                            disabled={submittingId === item.id}
                            onClick={() => handleView(item)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--edit"
                            disabled={submittingId === item.id}
                            onClick={() => handleOpenEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn--delete"
                            disabled={submittingId === item.id}
                            onClick={() =>
                              setDeleteTarget({
                                id: item.id,
                                sku: item.sku,
                                product_name: item.product_name,
                              })
                            }
                          >
                            Delete
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

        <div className="admin-pagination">
          <button
            type="button"
            disabled={loading || pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Trước
          </button>
          <span>
            Trang {pagination.page}/{pagination.totalPages} ({pagination.total} SKU)
          </span>
          <button
            type="button"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Sau
          </button>
        </div>
      </section>

      {viewItem ? (
        <div className="admin-modal-overlay" onClick={() => setViewItem(null)} role="presentation">
          <article className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>Chi tiết nhanh SKU</h3>
              <button type="button" onClick={() => setViewItem(null)}>Đóng</button>
            </header>

            <div className="admin-quick-info">
              <p><strong>Tên:</strong> {viewItem.product_name}</p>
              <p><strong>SKU:</strong> {viewItem.sku}</p>
              <p><strong>Giá niêm yết:</strong> {formatVnd(viewItem.price_compare || viewItem.price_sale)}</p>
              <p><strong>Giá bán:</strong> {formatVnd(viewItem.price_sale)}</p>
              <p><strong>CPU:</strong> {viewItem.cpu_option || '-'}</p>
              <p><strong>RAM:</strong> {viewItem.ram_option || '-'}</p>
              <p><strong>VGA:</strong> {viewItem.vga_option || '-'}</p>
              <p><strong>Storage:</strong> {viewItem.storage_option || '-'}</p>
              <p><strong>Màu:</strong> {viewItem.color_option || '-'}</p>
            </div>
          </article>
        </div>
      ) : null}

      {editItem ? (
        <div className="admin-modal-overlay" onClick={() => setEditItem(null)} role="presentation">
          <article className="admin-modal admin-modal--large" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>Chỉnh sửa SKU</h3>
              <button type="button" onClick={() => setEditItem(null)}>Đóng</button>
            </header>

            <form className="admin-form-grid" onSubmit={handleSubmitEdit}>
              <label>
                Dòng sản phẩm chung
                <select
                  value={editForm.group_id}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, group_id: event.target.value }))
                  }
                  required
                >
                  <option value="">-- Chọn dòng sản phẩm --</option>
                  {masterData.groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.group_name} ({group.brand_name} / {group.category_name})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tên phiên bản SKU
                <input
                  type="text"
                  value={editForm.product_name}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, product_name: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Mã SKU
                <input
                  type="text"
                  value={editForm.sku}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, sku: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                CPU
                <input
                  type="text"
                  value={editForm.cpu_option}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, cpu_option: event.target.value }))
                  }
                />
              </label>
              <label>
                RAM
                <input
                  type="text"
                  value={editForm.ram_option}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, ram_option: event.target.value }))
                  }
                />
              </label>
              <label>
                VGA
                <input
                  type="text"
                  value={editForm.vga_option}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, vga_option: event.target.value }))
                  }
                />
              </label>
              <label>
                Lưu trữ
                <input
                  type="text"
                  value={editForm.storage_option}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, storage_option: event.target.value }))
                  }
                />
              </label>
              <label>
                Màu sắc
                <input
                  type="text"
                  value={editForm.color_option}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, color_option: event.target.value }))
                  }
                />
              </label>
              <label>
                Giá bán
                <input
                  type="number"
                  min="0"
                  value={editForm.price_sale}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, price_sale: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Giá niêm yết
                <input
                  type="number"
                  min="0"
                  value={editForm.price_compare}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, price_compare: event.target.value }))
                  }
                />
              </label>
              <label>
                Tồn kho
                <input
                  type="number"
                  min="0"
                  value={editForm.stock_quantity}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, stock_quantity: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Trạng thái
                <select
                  value={editForm.is_active}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, is_active: Number(event.target.value) }))
                  }
                >
                  <option value={1}>Đang kích hoạt</option>
                  <option value={0}>Khóa</option>
                </select>
              </label>
              <label className="admin-form-grid__full">
                Ảnh sản phẩm (mỗi dòng 1 URL)
                <textarea
                  rows={4}
                  value={editForm.image_urls_text}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, image_urls_text: event.target.value }))
                  }
                />
              </label>

              <div className="admin-form-actions">
                <button type="button" onClick={() => setEditItem(null)}>
                  Hủy
                </button>
                <button type="submit" disabled={submittingId === editItem.id}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </article>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="admin-modal-overlay" role="presentation">
          <article className="admin-modal admin-confirm-modal">
            <header>
              <h3>Xác nhận xóa SKU</h3>
            </header>

            <div className="admin-confirm-body">
              <p>
                Bạn có chắc muốn xóa
                {' '}
                <strong>{deleteTarget.product_name}</strong>
                {' '}
                ({deleteTarget.sku})?
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

export default AdminProductList;
