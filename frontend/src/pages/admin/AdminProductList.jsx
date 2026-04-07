import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  createProductGroup,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductMasterData,
  getProductGroups,
  uploadProductImages,
  updateProductGroup,
  updateProduct,
  updateProductStatus,
} from '../../services/product/productService.js';

const LIMIT = 10;

function formatCurrencyInput(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  return Number(digits).toLocaleString('vi-VN');
}

function parseCurrencyInputToNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

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

function getDetailImageUrls(item) {
  const urls = (item?.images || [])
    .map((image) => String(image?.image_url || '').trim())
    .filter(Boolean);

  if (urls.length > 0) {
    return urls;
  }

  const fallback = String(item?.primary_image || '').trim();
  return fallback ? [fallback] : [];
}

function getFileIdentity(file) {
  return [file.name, file.size, file.lastModified, file.type].join('::');
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageItemKey(item) {
  if (item?.kind === 'existing') {
    return `existing:${item.url}`;
  }

  if (item?.kind === 'file') {
    const file = item.file;
    return `file:${getFileIdentity(file)}`;
  }

  return '';
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

  const [editItem, setEditItem] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [viewItem, setViewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    brand_id: '',
    category_id: '',
    link_code: '',
    is_featured: 0,
    product_name: '',
    sku: '',
    cpu_option: '',
    ram_option: '',
    storage_option: '',
    vga_option: '',
    color_option: '',
    price_sale: '',
    stock_quantity: '',
    is_active: 1,
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
      toast.success('Đã xoá Sản Phẩm.');
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
        brand_id: String(detail.brand_id || ''),
        category_id: String(detail.category_id || ''),
        link_code: detail.group_name || '',
        is_featured: Number(detail.is_featured) ? 1 : 0,
        product_name: detail.product_name || '',
        sku: detail.sku || '',
        cpu_option: detail.cpu_option || '',
        ram_option: detail.ram_option || '',
        storage_option: detail.storage_option || '',
        vga_option: detail.vga_option || '',
        color_option: detail.color_option || '',
        price_sale: formatCurrencyInput(detail.price_sale || ''),
        stock_quantity: String(detail.stock_quantity || 0),
        is_active: Number(detail.is_active) ? 1 : 0,
      });

      const initialImages = (detail.images || [])
        .map((img) => String(img?.image_url || '').trim())
        .filter(Boolean)
        .map((url) => ({ kind: 'existing', url }));

      setEditImages(initialImages);
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể mở form chỉnh sửa.';
      toast.error(message);
    }
  }

  async function handleEditFilesChange(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const readableFiles = [];
    const filePreviews = await Promise.all(
      files.map(async (file) => ({
        file,
        preview: await readFileAsDataUrl(file),
      }))
    );

    setEditImages((prev) => {
      const existed = new Set(prev.map((item) => getImageItemKey(item)));
      const nextItems = filePreviews
        .filter(({ file }) => !existed.has(`file:${getFileIdentity(file)}`))
        .map(({ file, preview }) => ({
          kind: 'file',
          file,
          preview,
        }));

      return [...prev, ...nextItems];
    });

    event.target.value = '';
  }

  function removeEditImage(index) {
    setEditImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmitEdit(event) {
    event.preventDefault();

    if (!editItem) {
      return;
    }

    const existingImageUrls = editImages
      .filter((item) => item.kind === 'existing')
      .map((item) => item.url)
      .filter(Boolean);

    const fileItems = editImages.filter((item) => item.kind === 'file');
    let uploadedImageUrls = [];

    if (fileItems.length > 0) {
      try {
        const uploadResponse = await uploadProductImages(fileItems.map((item) => item.file));
        uploadedImageUrls = uploadResponse?.data?.image_urls || [];
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể upload ảnh sản phẩm.';
        toast.error(message);
        return;
      }
    }

    const imageUrls = [...existingImageUrls, ...uploadedImageUrls];

    const linkCode = String(editForm.link_code || '').trim();
    let resolvedGroupId = null;

    if (linkCode) {
      if (!editForm.brand_id || !editForm.category_id) {
        toast.error('Nếu có mã liên kết, vui lòng chọn đủ Hãng và Danh mục.');
        return;
      }

      const groupPayload = {
        brand_id: Number(editForm.brand_id),
        category_id: Number(editForm.category_id),
        group_name: linkCode,
        short_description: editItem.group_short_description || editItem.product_name || linkCode,
        description: editItem.group_description || '',
        warranty_months: Number(editItem.warranty_months || 12),
        is_featured: Number(editForm.is_featured) ? 1 : 0,
      };

      try {
        const groupsResponse = await getProductGroups({
          brandId: Number(editForm.brand_id),
          categoryId: Number(editForm.category_id),
        });

        const normalizedLinkCode = linkCode.toLowerCase();
        const matchedGroup = (groupsResponse?.data || []).find(
          (group) => String(group.group_name || '').trim().toLowerCase() === normalizedLinkCode
        );

        if (matchedGroup?.id) {
          resolvedGroupId = Number(matchedGroup.id);
          await updateProductGroup(resolvedGroupId, groupPayload);
        } else {
          const createdGroupResponse = await createProductGroup({
            ...groupPayload,
          });

          resolvedGroupId = Number(createdGroupResponse?.data?.id || 0) || null;
        }
      } catch (error) {
        const message = error?.response?.data?.message || 'Không thể xử lý mã liên kết.';
        toast.error(message);
        return;
      }
    }

    const payload = {
      group_id: resolvedGroupId,
      product_name: editForm.product_name.trim(),
      sku: editForm.sku.trim(),
      cpu_option: editForm.cpu_option.trim(),
      ram_option: editForm.ram_option.trim(),
      storage_option: editForm.storage_option.trim(),
      vga_option: editForm.vga_option.trim(),
      color_option: editForm.color_option.trim(),
      price_sale: parseCurrencyInputToNumber(editForm.price_sale),
      price_compare: null,
      stock_quantity: Number(editForm.stock_quantity || 0),
      is_active: Number(editForm.is_active) ? 1 : 0,
      image_urls: imageUrls,
    };

    if (!payload.product_name || !payload.sku || !payload.price_sale) {
      toast.error('Vui lòng nhập đủ Tên SKU, Mã SKU và Giá bán.');
      return;
    }

    try {
      setSubmittingId(editItem.id);
      await updateProduct(editItem.id, payload);
      setEditItem(null);
      setEditImages([]);

      setProducts((prev) =>
        prev.map((item) =>
          item.id === editItem.id
            ? {
                ...item,
                group_id: payload.group_id,
                group_name: linkCode || null,
                product_name: payload.product_name,
                sku: payload.sku,
                cpu_option: payload.cpu_option,
                ram_option: payload.ram_option,
                storage_option: payload.storage_option,
                vga_option: payload.vga_option,
                color_option: payload.color_option,
                price_sale: payload.price_sale,
                stock_quantity: payload.stock_quantity,
                is_active: payload.is_active,
                primary_image: imageUrls[0] || item.primary_image || null,
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

  function updateEditPriceField(field, value) {
    setEditForm((prev) => ({
      ...prev,
      [field]: formatCurrencyInput(value),
    }));
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

  return (
    <AdminLayout title="Quản lý Sản phẩm">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Danh sách tất cả Sản Phẩm</h2>
            <p>Lọc nhanh theo danh mục và hãng để quản trị tồn kho toàn bộ sản phẩm.</p>
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
                placeholder="Tìm theo tên, mã SKU..."
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
                  <th>Ảnh</th>
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
                    <td colSpan={10} className="admin-empty">
                      Không có SKU phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  products.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                      <td>
                        {item.primary_image ? (
                          <img
                            src={item.primary_image}
                            alt={item.product_name}
                            className="admin-table-thumb"
                          />
                        ) : (
                          <div className="admin-table-thumb admin-table-thumb--empty">No Img</div>
                        )}
                      </td>
                      <td>
                        <p className="admin-product-name">{item.product_name}</p>
                        <small>{item.sku}</small>
                      </td>
                      <td>{item.category_name || '-'}</td>
                      <td>{item.brand_name || '-'}</td>
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

      {editItem ? (
        <div className="admin-modal-overlay" onClick={() => setEditItem(null)} role="presentation">
          <article className="admin-modal admin-modal--large" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>Chỉnh sửa Sản Phẩm</h3>
              <button type="button" onClick={() => setEditItem(null)}>Đóng</button>
            </header>

            <form className="admin-form-grid" onSubmit={handleSubmitEdit}>
              <label>
                Hãng
                <select
                  value={editForm.brand_id}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, brand_id: event.target.value }))
                  }
                >
                  <option value="">-- Chọn hãng --</option>
                  {masterData.brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.brand_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Danh mục
                <select
                  value={editForm.category_id}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, category_id: event.target.value }))
                  }
                >
                  <option value="">-- Chọn danh mục --</option>
                  {masterData.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Mã liên kết
                <input
                  type="text"
                  value={editForm.link_code}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, link_code: event.target.value }))
                  }
                  placeholder="Ví dụ: LOQ 2024 (có thể để trống)"
                />
              </label>

              <label>
                Nổi bật
                <select
                  value={editForm.is_featured}
                  onChange={(event) =>
                    setEditForm((prev) => ({ ...prev, is_featured: Number(event.target.value) }))
                  }
                >
                  <option value={0}>Không</option>
                  <option value={1}>Có</option>
                </select>
              </label>

              <label>
                Tên
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
                Giá
                <div className="admin-input-with-unit">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editForm.price_sale}
                    onChange={(event) => updateEditPriceField('price_sale', event.target.value)}
                    placeholder="0"
                    required
                  />
                  <span>VND</span>
                </div>
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
                Thêm ảnh mới (Cloudinary)
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditFilesChange}
                  disabled={submittingId === editItem.id}
                />
              </label>

              <div className="admin-form-grid__full admin-edit-image-panel">
                <div className="admin-edit-image-panel__head">
                  <div>
                    <h4>Ảnh sản phẩm</h4>
                    <p>Ảnh đầu tiên là ảnh chính. Nhấn dấu X để bỏ ảnh không dùng.</p>
                  </div>
                </div>

                {editImages.length > 0 ? (
                  <div className="admin-edit-image-grid">
                    {editImages.map((item, index) => (
                      <div className="admin-edit-image-card" key={`${getImageItemKey(item)}-${index + 1}`}>
                        <button
                          type="button"
                          className="admin-edit-image-remove"
                          onClick={() => removeEditImage(index)}
                          disabled={submittingId === editItem.id}
                          aria-label="Xóa ảnh"
                        >
                          ×
                        </button>
                        <img src={item.kind === 'existing' ? item.url : item.preview} alt={`Ảnh ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-edit-image-empty">Chưa có ảnh nào. Hãy tải lên ảnh chính trước.</p>
                )}
              </div>

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

      {viewItem ? (
        <div className="admin-modal-overlay" onClick={() => setViewItem(null)} role="presentation">
          <article className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h3>Chi tiết sản phẩm</h3>
              <button type="button" onClick={() => setViewItem(null)}>Đóng</button>
            </header>

            <div className="admin-quick-info">
              <p><strong>Tên:</strong> {viewItem.product_name || '-'}</p>
              <p><strong>Mã SKU:</strong> {viewItem.sku || '-'}</p>
              <p><strong>Mã liên kết:</strong> {viewItem.group_name || '-'}</p>
              <p><strong>Nổi bật:</strong> {Number(viewItem.is_featured) ? 'Có' : 'Không'}</p>
              <p><strong>Hãng:</strong> {viewItem.brand_name || '-'}</p>
              <p><strong>Danh mục:</strong> {viewItem.category_name || '-'}</p>
              <p><strong>CPU:</strong> {viewItem.cpu_option || '-'}</p>
              <p><strong>RAM:</strong> {viewItem.ram_option || '-'}</p>
              <p><strong>VGA:</strong> {viewItem.vga_option || '-'}</p>
              <p><strong>Lưu trữ:</strong> {viewItem.storage_option || '-'}</p>
              <p><strong>Màu sắc:</strong> {viewItem.color_option || '-'}</p>
              <p><strong>Giá:</strong> {formatVnd(viewItem.price_sale)}</p>
              <p><strong>Tồn kho:</strong> {viewItem.stock_quantity ?? 0}</p>
              <p><strong>Trạng thái:</strong> {Number(viewItem.is_active) ? 'Đang kích hoạt' : 'Khóa'}</p>
            </div>

            <div className="admin-view-gallery-wrap">
              <h4>Ảnh sản phẩm</h4>
              {getDetailImageUrls(viewItem).length > 0 ? (
                <div className="admin-view-gallery-grid">
                  {getDetailImageUrls(viewItem).map((url, index) => (
                    <img key={`${url}-${index + 1}`} src={url} alt={`${viewItem.product_name || 'product'}-${index + 1}`} className="admin-view-gallery-item" />
                  ))}
                </div>
              ) : (
                <p className="admin-view-gallery-empty">Chưa có ảnh cho sản phẩm này.</p>
              )}
            </div>
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

