import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import AdminLayout from '../layouts/AdminLayout.jsx';
import {
  getAllProducts,
  createProduct,
  createProductGroup,
  getProductMasterData,
} from '../services/productService.js';

function AdminProductCreate() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [masterData, setMasterData] = useState({
    brands: [],
    categories: [],
    groups: [],
  });

  const [groupMode, setGroupMode] = useState('existing');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const [groupForm, setGroupForm] = useState({
    brand_id: '',
    category_id: '',
    group_name: '',
    short_description: '',
    description: '',
    warranty_months: 24,
    is_featured: 0,
  });

  const [skuForm, setSkuForm] = useState({
    product_name: '',
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
    image_urls_text: '',
  });

  useEffect(() => {
    async function loadMasterData() {
      try {
        setLoading(true);
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
                brand_id: item.brand_id,
                category_id: item.category_id,
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
                brand_id: item.brand_id,
                category_id: item.category_id,
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

  const filteredGroups = useMemo(() => {
    return masterData.groups.filter((group) => {
      const matchBrand =
        !groupForm.brand_id || Number(group.brand_id) === Number(groupForm.brand_id);
      const matchCategory =
        !groupForm.category_id || Number(group.category_id) === Number(groupForm.category_id);
      return matchBrand && matchCategory;
    });
  }, [masterData.groups, groupForm.brand_id, groupForm.category_id]);

  function updateGroupForm(field, value) {
    setGroupMode('new');
    setGroupForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSkuForm(field, value) {
    setSkuForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateStep1() {
    if (groupMode === 'existing') {
      if (!selectedGroupId) {
        toast.error('Vui lòng chọn dòng sản phẩm chung.');
        return false;
      }
      return true;
    }

    if (!groupForm.brand_id || !groupForm.category_id || !groupForm.group_name.trim()) {
      toast.error('Vui lòng nhập đủ Hãng, Danh mục, Tên dòng sản phẩm.');
      return false;
    }

    return true;
  }

  function handleNextStep() {
    if (!validateStep1()) {
      return;
    }

    setStep(2);
  }

  async function handleCreate() {
    if (!skuForm.product_name.trim() || !skuForm.sku.trim() || !skuForm.price_sale) {
      toast.error('Vui lòng nhập đủ Tên SKU, Mã SKU, Giá bán.');
      return;
    }

    try {
      setSaving(true);

      let groupId = selectedGroupId;

      if (groupMode === 'new') {
        const createdGroupResponse = await createProductGroup({
          brand_id: Number(groupForm.brand_id),
          category_id: Number(groupForm.category_id),
          group_name: groupForm.group_name.trim(),
          short_description: groupForm.short_description.trim(),
          description: groupForm.description.trim(),
          warranty_months: Number(groupForm.warranty_months || 12),
          is_featured: Number(groupForm.is_featured) ? 1 : 0,
        });

        groupId = createdGroupResponse?.data?.id;

        if (!groupId) {
          toast.error('Không tạo được dòng sản phẩm mới. Vui lòng thử lại.');
          return;
        }
      }

      const imageUrls = skuForm.image_urls_text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      await createProduct({
        group_id: Number(groupId),
        product_name: skuForm.product_name.trim(),
        sku: skuForm.sku.trim(),
        cpu_option: skuForm.cpu_option.trim(),
        ram_option: skuForm.ram_option.trim(),
        storage_option: skuForm.storage_option.trim(),
        vga_option: skuForm.vga_option.trim(),
        color_option: skuForm.color_option.trim(),
        price_sale: Number(skuForm.price_sale),
        price_compare: skuForm.price_compare === '' ? null : Number(skuForm.price_compare),
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
            <h2>Form 2 bước: Dòng sản phẩm + SKU</h2>
            <p>Chọn hoặc tạo dòng sản phẩm chung trước khi khai báo phiên bản SKU chi tiết.</p>
          </div>
        </div>

        <div className="admin-mode-switch">
          <button
            type="button"
            className={`admin-step ${groupMode === 'existing' ? 'is-active' : ''}`}
            onClick={() => setGroupMode('existing')}
          >
            Chọn dòng sản phẩm có sẵn
          </button>
          <button
            type="button"
            className={`admin-step ${groupMode === 'new' ? 'is-active' : ''}`}
            onClick={() => setGroupMode('new')}
          >
            Tạo dòng sản phẩm mới
          </button>
        </div>

        <div className="admin-stepper">
          <button
            type="button"
            className={`admin-step ${step === 1 ? 'is-active' : ''}`}
            onClick={() => setStep(1)}
          >
            Bước 1: Dòng sản phẩm
          </button>
          <button
            type="button"
            className={`admin-step ${step === 2 ? 'is-active' : ''}`}
            onClick={handleNextStep}
          >
            Bước 2: Phiên bản SKU
          </button>
        </div>

        {step === 1 ? (
          <div className="admin-grid-two">
            <article className="admin-sub-panel">
              <h3>Chọn dòng sản phẩm có sẵn</h3>

              <div className="admin-form-grid">
                <label>
                  Hãng
                  <select
                    value={groupForm.brand_id}
                    onChange={(event) => updateGroupForm('brand_id', event.target.value)}
                  >
                    <option value="">Tất cả hãng</option>
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
                    value={groupForm.category_id}
                    onChange={(event) => updateGroupForm('category_id', event.target.value)}
                  >
                    <option value="">Tất cả danh mục</option>
                    {masterData.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-form-grid__full">
                  Dòng sản phẩm
                  <select
                    value={selectedGroupId}
                    onChange={(event) => {
                      setGroupMode('existing');
                      setSelectedGroupId(event.target.value);
                    }}
                  >
                    <option value="">-- Chọn dòng sản phẩm --</option>
                    {filteredGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.group_name} ({group.brand_name} / {group.category_name})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="admin-helper-text">
                Chế độ hiện tại: {groupMode === 'existing' ? 'Dùng dòng có sẵn' : 'Đang tạo dòng mới'}
              </p>
            </article>

            <article className="admin-sub-panel">
              <h3>Tạo dòng sản phẩm mới</h3>

              <div className="admin-form-grid">
                <label>
                  Hãng
                  <select
                    value={groupForm.brand_id}
                    onChange={(event) => updateGroupForm('brand_id', event.target.value)}
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
                    value={groupForm.category_id}
                    onChange={(event) => updateGroupForm('category_id', event.target.value)}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {masterData.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-form-grid__full">
                  Tên dòng sản phẩm
                  <input
                    type="text"
                    value={groupForm.group_name}
                    onChange={(event) => updateGroupForm('group_name', event.target.value)}
                  />
                </label>

                <label className="admin-form-grid__full">
                  Mô tả ngắn
                  <input
                    type="text"
                    value={groupForm.short_description}
                    onChange={(event) =>
                      updateGroupForm('short_description', event.target.value)
                    }
                  />
                </label>

                <label className="admin-form-grid__full">
                  Mô tả chi tiết
                  <textarea
                    rows={4}
                    value={groupForm.description}
                    onChange={(event) => updateGroupForm('description', event.target.value)}
                  />
                </label>

                <label>
                  Bảo hành (tháng)
                  <input
                    type="number"
                    min="1"
                    value={groupForm.warranty_months}
                    onChange={(event) =>
                      updateGroupForm('warranty_months', event.target.value)
                    }
                  />
                </label>

                <label>
                  Nổi bật
                  <select
                    value={groupForm.is_featured}
                    onChange={(event) => updateGroupForm('is_featured', event.target.value)}
                  >
                    <option value={0}>Không</option>
                    <option value={1}>Có</option>
                  </select>
                </label>
              </div>

              <p className="admin-helper-text">
                Chế độ hiện tại: {groupMode === 'new' ? 'Tạo dòng mới' : 'Chưa bật tạo dòng mới'}
              </p>
            </article>
          </div>
        ) : (
          <article className="admin-sub-panel">
            <h3>Khai báo phiên bản SKU</h3>

            <div className="admin-form-grid">
              <label>
                Tên phiên bản SKU
                <input
                  type="text"
                  value={skuForm.product_name}
                  onChange={(event) => updateSkuForm('product_name', event.target.value)}
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
                Giá bán thực tế
                <input
                  type="number"
                  min="0"
                  value={skuForm.price_sale}
                  onChange={(event) => updateSkuForm('price_sale', event.target.value)}
                />
              </label>
              <label>
                Giá niêm yết
                <input
                  type="number"
                  min="0"
                  value={skuForm.price_compare}
                  onChange={(event) => updateSkuForm('price_compare', event.target.value)}
                />
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
                Upload ảnh (nhập URL, mỗi dòng 1 ảnh)
                <textarea
                  rows={5}
                  value={skuForm.image_urls_text}
                  onChange={(event) => updateSkuForm('image_urls_text', event.target.value)}
                  placeholder="https://example.com/image-1.jpg"
                />
              </label>
            </div>
          </article>
        )}

        <div className="admin-form-actions">
          <button type="button" onClick={() => navigate('/admin/products')}>
            Quay lại danh sách
          </button>
          {step === 1 ? (
            <button type="button" onClick={handleNextStep}>
              Tiếp tục bước 2
            </button>
          ) : (
            <button type="button" onClick={handleCreate} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Tạo sản phẩm mới'}
            </button>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default AdminProductCreate;
