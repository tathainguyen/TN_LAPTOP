import {
  createProduct,
  createProductGroup,
  deleteProductById,
  getAllProducts,
  getBrands,
  getCategories,
  getProductById,
  getProductBySlug,
  getProductGroups,
  getProductImages,
  updateProductById,
  updateProductStatusById,
} from '../models/productModel.js';

function normalizeDbErrorMessage(error, fallbackMessage) {
  const code = error?.code;
  const message = String(error?.sqlMessage || error?.message || '');

  if (code === 'ER_DUP_ENTRY') {
    if (message.includes('uk_products_sku')) {
      return 'Mã SKU đã tồn tại. Vui lòng dùng mã SKU khác.';
    }

    if (message.includes('uk_products_slug')) {
      return 'Slug sản phẩm đã tồn tại. Vui lòng đổi tên SKU.';
    }

    if (message.includes('uk_product_groups_slug')) {
      return 'Slug dòng sản phẩm đã tồn tại. Vui lòng đổi tên dòng sản phẩm.';
    }

    return 'Dữ liệu đã tồn tại trong hệ thống.';
  }

  if (code === 'ER_NO_REFERENCED_ROW_2') {
    return 'Dữ liệu liên kết không hợp lệ (hãng, danh mục hoặc dòng sản phẩm).';
  }

  return fallbackMessage;
}

export async function getProducts(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const brandId = req.query.brandId ? Number(req.query.brandId) : null;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
    const keyword = req.query.keyword || '';

    const usePaging = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;

    const products = await getAllProducts(
      usePaging
        ? { page, limit, brandId, categoryId, keyword }
        : { brandId, categoryId, keyword }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách sản phẩm thành công.',
      data: products,
    });
  } catch (error) {
    console.error('❌ Lỗi getProducts:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách sản phẩm.',
      data: null,
    });
  }
}

export async function getProductByIdDetail(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID sản phẩm không hợp lệ.',
        data: null,
      });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm.',
        data: null,
      });
    }

    const images = await getProductImages(id);

    return res.status(200).json({
      status: 'success',
      message: 'Lấy chi tiết sản phẩm thành công.',
      data: {
        ...product,
        images,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi getProductByIdDetail:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy chi tiết sản phẩm.',
      data: null,
    });
  }
}

export async function getProductMasterData(req, res) {
  try {
    const [brands, categories, groups] = await Promise.all([
      getBrands(),
      getCategories(),
      getProductGroups(),
    ]);

    return res.status(200).json({
      status: 'success',
      message: 'Lấy dữ liệu danh mục quản trị sản phẩm thành công.',
      data: {
        brands,
        categories,
        groups,
      },
    });
  } catch (error) {
    console.error('❌ Lỗi getProductMasterData:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy dữ liệu danh mục.',
      data: null,
    });
  }
}

export async function getGroups(req, res) {
  try {
    const brandId = req.query.brandId ? Number(req.query.brandId) : null;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
    const groups = await getProductGroups({ brandId, categoryId });

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách dòng sản phẩm thành công.',
      data: groups,
    });
  } catch (error) {
    console.error('❌ Lỗi getGroups:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách dòng sản phẩm.',
      data: null,
    });
  }
}

export async function createGroup(req, res) {
  try {
    const {
      brand_id,
      category_id,
      group_name,
      short_description,
      description,
      warranty_months,
      is_featured,
    } = req.body;

    if (!brand_id || !category_id || !group_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu trường bắt buộc: brand_id, category_id, group_name.',
        data: null,
      });
    }

    const created = await createProductGroup({
      brandId: Number(brand_id),
      categoryId: Number(category_id),
      groupName: group_name,
      shortDescription: short_description,
      description,
      warrantyMonths: Number(warranty_months || 12),
      isFeatured: Number(is_featured) ? 1 : 0,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tạo dòng sản phẩm thành công.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Lỗi createGroup:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể tạo dòng sản phẩm.'),
      data: null,
    });
  }
}

export async function createSku(req, res) {
  try {
    const {
      group_id,
      product_name,
      sku,
      cpu_option,
      ram_option,
      storage_option,
      vga_option,
      color_option,
      price_sale,
      price_compare,
      stock_quantity,
      is_active,
      image_urls,
    } = req.body;

    if (!group_id || !product_name || !sku || !price_sale) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu trường bắt buộc: group_id, product_name, sku, price_sale.',
        data: null,
      });
    }

    const created = await createProduct({
      groupId: Number(group_id),
      productName: product_name,
      sku,
      cpuOption: cpu_option,
      ramOption: ram_option,
      storageOption: storage_option,
      vgaOption: vga_option,
      colorOption: color_option,
      priceSale: Number(price_sale),
      priceCompare: price_compare,
      stockQuantity: Number(stock_quantity || 0),
      isActive: Number(is_active) ? 1 : 0,
      imageUrls: Array.isArray(image_urls) ? image_urls : [],
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tạo SKU mới thành công.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Lỗi createSku:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể tạo SKU mới.'),
      data: null,
    });
  }
}

export async function updateSku(req, res) {
  try {
    const id = Number(req.params.id);
    const {
      group_id,
      product_name,
      sku,
      cpu_option,
      ram_option,
      storage_option,
      vga_option,
      color_option,
      price_sale,
      price_compare,
      stock_quantity,
      is_active,
      image_urls,
    } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID sản phẩm không hợp lệ.',
        data: null,
      });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm để cập nhật.',
        data: null,
      });
    }

    if (!group_id || !product_name || !sku || !price_sale) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu trường bắt buộc: group_id, product_name, sku, price_sale.',
        data: null,
      });
    }

    const updated = await updateProductById(id, {
      groupId: Number(group_id),
      productName: product_name,
      sku,
      cpuOption: cpu_option,
      ramOption: ram_option,
      storageOption: storage_option,
      vgaOption: vga_option,
      colorOption: color_option,
      priceSale: Number(price_sale),
      priceCompare: price_compare,
      stockQuantity: Number(stock_quantity || 0),
      isActive: Number(is_active) ? 1 : 0,
      imageUrls: Array.isArray(image_urls) ? image_urls : null,
    });

    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Cập nhật SKU thất bại.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật SKU thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi updateSku:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể cập nhật SKU.'),
      data: null,
    });
  }
}

export async function toggleSkuStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID sản phẩm không hợp lệ.',
        data: null,
      });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm để đổi trạng thái.',
        data: null,
      });
    }

    const updated = await updateProductStatusById(id, Number(is_active) ? 1 : 0);

    if (!updated) {
      return res.status(400).json({
        status: 'error',
        message: 'Đổi trạng thái thất bại.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Đổi trạng thái thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi toggleSkuStatus:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đổi trạng thái SKU.',
      data: null,
    });
  }
}

export async function deleteSku(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID sản phẩm không hợp lệ.',
        data: null,
      });
    }

    const existing = await getProductById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm để xóa.',
        data: null,
      });
    }

    const deleted = await deleteProductById(id);

    if (!deleted) {
      return res.status(400).json({
        status: 'error',
        message: 'Xóa SKU thất bại.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xóa SKU thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi deleteSku:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể xóa SKU.',
      data: null,
    });
  }
}

export async function getProductDetail(req, res) {
  try {
    const { slug } = req.params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy sản phẩm.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Lấy chi tiết sản phẩm thành công.',
      data: product,
    });
  } catch (error) {
    console.error('❌ Lỗi getProductDetail:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy chi tiết sản phẩm.',
      data: null,
    });
  }
}
