import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../../layouts/AdminLayout.jsx';
import {
  getAllProducts,
  createProduct,
  createProductGroup,
  getProductGroups,
  getProductMasterData,
  uploadProductImages,
} from '../../services/product/productService.js';

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

function AdminProductCreate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [masterData, setMasterData] = useState({
    brands: [],
    categories: [],
  });

  const [productForm, setProductForm] = useState({
    brand_id: '',
    category_id: '',
    product_name: '',
    link_code: '',
    description: '',
    warranty_months: 24,
    is_featured: 0,
  });

  const [skuForm, setSkuForm] = useState({
    sku: '',
    cpu_option: '',
    ram_option: '',
    storage_option: '',
    vga_option: '',
    color_option: '',
    price_sale: '',
    price_compare: '',
    stock_quantity: 0,
    is_active: 1,
  });

  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoading(true);
        const response = await getProductMasterData();

        const brands = response?.data?.brands || [];
        const categories = response?.data?.categories || [];

        if (brands.length === 0 && categories.length === 0) {
          const fallback = await getAllProducts();
          const all = Array.isArray(fallback?.data)
            ? fallback.data
            : fallback?.data?.items || [];

          const dedupBrands = [];
          const dedupCategories = [];
          const brandSet = new Set();
          const categorySet = new Set();

          all.forEach((item) => {
            if (item.brand_id && !brandSet.has(item.brand_id)) {
              brandSet.add(item.brand_id);
              dedupBrands.push({ id: item.brand_id, brand_name: item.brand_name });
            }

            if (item.category_id && !categorySet.has(item.category_id)) {
              categorySet.add(item.category_id);
              dedupCategories.push({ id: item.category_id, category_name: item.category_name });
            }
          });

          setMasterData({
            brands: dedupBrands,
            categories: dedupCategories,
          });

          return;
        }

        setMasterData({
          brands,
          categories,
        });
      } catch (error) {
        try {
          const fallback = await getAllProducts();
          const all = Array.isArray(fallback?.data)
            ? fallback.data
            : fallback?.data?.items || [];

          const dedupBrands = [];
          const dedupCategories = [];
          const brandSet = new Set();
          const categorySet = new Set();

          all.forEach((item) => {
            if (item.brand_id && !brandSet.has(item.brand_id)) {
              brandSet.add(item.brand_id);
              dedupBrands.push({ id: item.brand_id, brand_name: item.brand_name });
            }

            if (item.category_id && !categorySet.has(item.category_id)) {
              categorySet.add(item.category_id);
              dedupCategories.push({ id: item.category_id, category_name: item.category_name });
            }
          });

          setMasterData({
            brands: dedupBrands,
            categories: dedupCategories,
          });
          toast('Đang dùng dữ liệu tạm từ danh sách SKU.', { icon: 'ℹ️' });
        } catch {
          const message = error?.response?.data?.message || 'Không thể tải dữ liệu nền.';
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadMasterData();
  }, []);

  function updateProductForm(field, value) {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSkuForm(field, value) {
    setSkuForm((prev) => ({ ...prev, [field]: value }));
  }

  function updatePriceField(field, value) {
    setSkuForm((prev) => ({
      ...prev,
      [field]: formatCurrencyInput(value),
    }));
  }

  function handleImageFilesChange(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setSelectedImageFiles((prev) => {
      const existed = new Set(prev.map((file) => getFileIdentity(file)));
      const newlyAddedFiles = files.filter((file) => !existed.has(getFileIdentity(file)));
      return [...prev, ...newlyAddedFiles];
    });

    event.target.value = '';
  }

  function removeSelectedImage(indexToRemove) {
    setSelectedImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  }

  useEffect(() => {
    let cancelled = false;

    async function buildPreviews() {
      if (selectedImageFiles.length === 0) {
        setPreviewUrls([]);
        return;
      }

      try {
        const urls = await Promise.all(selectedImageFiles.map((file) => readFileAsDataUrl(file)));
        if (!cancelled) {
          setPreviewUrls(urls.filter(Boolean));
        }
      } catch {
        if (!cancelled) {
          setPreviewUrls([]);
        }
      }
    }

    buildPreviews();

    return () => {
      cancelled = true;
    };
  }, [selectedImageFiles]);

  function validateForm() {
    if (
      !productForm.brand_id ||
      !productForm.category_id ||
      !productForm.product_name.trim()
    ) {
      toast.error('Vui lòng nhập đủ Hãng, Danh mục và Tên sản phẩm.');
      return false;
    }

    if (!skuForm.sku.trim() || !skuForm.price_sale) {
      toast.error('Vui lòng nhập đủ Mã SKU và Giá.');
      return false;
    }

    return true;
  }

  async function handleCreate() {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      let groupId = null;
      const linkCode = productForm.link_code.trim();

      if (linkCode) {
        const groupsResponse = await getProductGroups({
          brandId: Number(productForm.brand_id),
          categoryId: Number(productForm.category_id),
        });

        const normalizedLinkCode = linkCode.toLowerCase();
        const existingGroup = (groupsResponse?.data || []).find(
          (group) => String(group.group_name || '').trim().toLowerCase() === normalizedLinkCode
        );

        groupId = existingGroup?.id || null;

        if (!groupId) {
          const createdGroupResponse = await createProductGroup({
            brand_id: Number(productForm.brand_id),
            category_id: Number(productForm.category_id),
            group_name: linkCode,
            short_description: productForm.product_name.trim(),
            description: productForm.description.trim(),
            warranty_months: Number(productForm.warranty_months || 12),
            is_featured: Number(productForm.is_featured) ? 1 : 0,
          });

          groupId = createdGroupResponse?.data?.id || null;
        }

        if (!groupId) {
          toast.error('Không tạo hoặc tìm được mã liên kết. Vui lòng thử lại.');
          return;
        }
      }

      let uploadedImageUrls = [];

      if (selectedImageFiles.length > 0) {
        const uploadResponse = await uploadProductImages(selectedImageFiles);
        uploadedImageUrls = uploadResponse?.data?.image_urls || [];
      }

      const imageUrls = [...uploadedImageUrls];

      await createProduct({
        group_id: groupId,
        product_name: productForm.product_name.trim(),
        sku: skuForm.sku.trim(),
        cpu_option: skuForm.cpu_option.trim(),
        ram_option: skuForm.ram_option.trim(),
        storage_option: skuForm.storage_option.trim(),
        vga_option: skuForm.vga_option.trim(),
        color_option: skuForm.color_option.trim(),
        price_sale: parseCurrencyInputToNumber(skuForm.price_sale),
        price_compare: skuForm.price_compare
          ? parseCurrencyInputToNumber(skuForm.price_compare)
          : null,
        stock_quantity: Number(skuForm.stock_quantity || 0),
        is_active: Number(skuForm.is_active) ? 1 : 0,
        image_urls: imageUrls,
      });

      toast.success('Tạo sản phẩm mới thành công.');
      navigate('/admin/products');
    } catch (error) {
      const message = error?.response?.data?.message || 'Không thể tạo sản phẩm mới.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Thêm Sản phẩm mới">
        <section className="admin-panel">
          <div className="admin-loading">Đang tải dữ liệu form...</div>
        </section>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Thêm Sản phẩm mới">
      <section className="admin-panel">
        <div className="admin-panel__head">
          <div>
            <h2>Thêm sản phẩm mới</h2>
            <p>Nhập thông tin chung và SKU trong một form duy nhất.</p>
          </div>
        </div>

        <article className="admin-sub-panel">
          <h3>Thông tin sản phẩm và SKU</h3>

          <div className="admin-form-grid">
            <label>
              Hãng
              <select
                value={productForm.brand_id}
                onChange={(event) => updateProductForm('brand_id', event.target.value)}
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
                value={productForm.category_id}
                onChange={(event) => updateProductForm('category_id', event.target.value)}
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
              Tên sản phẩm
              <input
                type="text"
                value={productForm.product_name}
                onChange={(event) => updateProductForm('product_name', event.target.value)}
                placeholder="Ví dụ: Lenovo LOQ 15"
              />
            </label>

            <label>
              Mã liên kết
              <input
                type="text"
                value={productForm.link_code}
                onChange={(event) => updateProductForm('link_code', event.target.value)}
                placeholder="Ví dụ: LOQ 2024"
              />
            </label>

            <label>
              Bảo hành (tháng)
              <input
                type="number"
                min="1"
                value={productForm.warranty_months}
                onChange={(event) => updateProductForm('warranty_months', event.target.value)}
              />
            </label>

            <label>
              Nổi bật
              <select
                value={productForm.is_featured}
                onChange={(event) => updateProductForm('is_featured', event.target.value)}
              >
                <option value={0}>Không</option>
                <option value={1}>Có</option>
              </select>
            </label>

            <label className="admin-form-grid__full">
              Mô tả
              <textarea
                rows={4}
                value={productForm.description}
                onChange={(event) => updateProductForm('description', event.target.value)}
              />
            </label>

            <label>
              Mã SKU
              <input
                type="text"
                value={skuForm.sku}
                onChange={(event) => updateSkuForm('sku', event.target.value)}
              />
            </label>

            <label>
              CPU
              <input
                type="text"
                value={skuForm.cpu_option}
                onChange={(event) => updateSkuForm('cpu_option', event.target.value)}
              />
            </label>

            <label>
              RAM
              <input
                type="text"
                value={skuForm.ram_option}
                onChange={(event) => updateSkuForm('ram_option', event.target.value)}
              />
            </label>

            <label>
              VGA
              <input
                type="text"
                value={skuForm.vga_option}
                onChange={(event) => updateSkuForm('vga_option', event.target.value)}
              />
            </label>

            <label>
              Lưu trữ
              <input
                type="text"
                value={skuForm.storage_option}
                onChange={(event) => updateSkuForm('storage_option', event.target.value)}
              />
            </label>

            <label>
              Màu sắc
              <input
                type="text"
                value={skuForm.color_option}
                onChange={(event) => updateSkuForm('color_option', event.target.value)}
              />
            </label>

            <label>
              Giá
              <div className="admin-input-with-unit">
                <input
                  type="text"
                  inputMode="numeric"
                  value={skuForm.price_sale}
                  onChange={(event) => updatePriceField('price_sale', event.target.value)}
                  placeholder="0"
                />
                <span>VND</span>
              </div>
            </label>

            <label>
              Giá giảm (tùy chọn)
              <div className="admin-input-with-unit">
                <input
                  type="text"
                  inputMode="numeric"
                  value={skuForm.price_compare}
                  onChange={(event) => updatePriceField('price_compare', event.target.value)}
                  placeholder="Để trống nếu không giảm giá"
                />
                <span>VND</span>
              </div>
            </label>

            <label>
              Tồn kho ban đầu
              <input
                type="number"
                min="0"
                value={skuForm.stock_quantity}
                onChange={(event) => updateSkuForm('stock_quantity', event.target.value)}
              />
            </label>

            <label>
              Trạng thái
              <select
                value={skuForm.is_active}
                onChange={(event) => updateSkuForm('is_active', event.target.value)}
              >
                <option value={1}>Đang kích hoạt</option>
                <option value={0}>Khóa</option>
              </select>
            </label>

            <label className="admin-form-grid__full">
              Upload ảnh từ máy (Cloudinary)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFilesChange}
              />
            </label>

            <p className="admin-helper-text admin-form-grid__full" style={{ marginTop: -4 }}>
              Bạn có thể chọn ảnh nhiều lần. Ảnh thêm đầu tiên sẽ là ảnh chính, các ảnh chọn sau là ảnh phụ.
            </p>

            <div className="admin-form-grid__full admin-edit-image-panel">
              <div className="admin-edit-image-panel__head">
                <div>
                  <h4>Ảnh sản phẩm</h4>
                  <p>Ảnh đầu tiên là ảnh chính. Nhấn dấu X để bỏ ảnh không dùng.</p>
                </div>
              </div>

              {previewUrls.length > 0 ? (
                <div className="admin-edit-image-grid">
                  {previewUrls.map((url, index) => (
                    <div className="admin-edit-image-card" key={`${url}-${index + 1}`}>
                      <button
                        type="button"
                        className="admin-edit-image-remove"
                        onClick={() => removeSelectedImage(index)}
                        aria-label="Xóa ảnh"
                      >
                        ×
                      </button>
                      <img src={url} alt={`Preview ${index + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-edit-image-empty">
                  Chưa có ảnh nào. Hãy tải ảnh từ máy để xem trước ở đây.
                </div>
              )}
            </div>
          </div>

          <p className="admin-helper-text">
            Trường Mã liên kết được dùng để gom các SKU cùng model hiển thị ở trang chi tiết.
          </p>
        </article>

        <div className="admin-form-actions">
          <button type="button" onClick={() => navigate('/admin/products')}>
            Quay lại danh sách
          </button>
          <button type="button" onClick={handleCreate} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Tạo sản phẩm mới'}
          </button>
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminProductCreate;

