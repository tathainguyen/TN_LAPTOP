import {
  createBrand,
  createCategory,
  deleteBrandById,
  deleteCategoryById,
  getBrands,
  getCategories,
  toggleBrandStatus,
  toggleCategoryStatus,
  updateBrand,
  updateCategory,
} from '../models/catalogModel.js';

function normalizeDbErrorMessage(error, fallbackMessage) {
  const code = error?.code;

  if (code === 'ER_DUP_ENTRY') {
    return 'Dữ liệu đã tồn tại. Vui lòng đổi tên.';
  }

  if (code === 'ER_NO_REFERENCED_ROW_2') {
    return 'Dữ liệu cha không hợp lệ.';
  }

  if (code === 'ER_ROW_IS_REFERENCED_2') {
    return 'Không thể xóa vì dữ liệu đang được sử dụng ở nơi khác.';
  }

  return fallbackMessage;
}

export async function getBrandList(req, res) {
  try {
    const keyword = req.query.keyword || '';
    const status = req.query.status || 'all';
    const brands = await getBrands({ keyword, status });

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách nhãn hàng thành công.',
      data: brands,
    });
  } catch (error) {
    console.error('❌ Lỗi getBrandList:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách nhãn hàng.',
      data: null,
    });
  }
}

export async function createBrandItem(req, res) {
  try {
    const { brand_name, logo_url } = req.body;

    if (!brand_name || !String(brand_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu brand_name.',
        data: null,
      });
    }

    const created = await createBrand({
      brandName: String(brand_name).trim(),
      logoUrl: logo_url || null,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tạo nhãn hàng thành công.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Lỗi createBrandItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể tạo nhãn hàng.'),
      data: null,
    });
  }
}

export async function updateBrandItem(req, res) {
  try {
    const id = Number(req.params.id);
    const { brand_name, logo_url } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID nhãn hàng không hợp lệ.',
        data: null,
      });
    }

    if (!brand_name || !String(brand_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu brand_name.',
        data: null,
      });
    }

    const updated = await updateBrand(id, {
      brandName: String(brand_name).trim(),
      logoUrl: logo_url || null,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhãn hàng để cập nhật.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật nhãn hàng thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi updateBrandItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể cập nhật nhãn hàng.'),
      data: null,
    });
  }
}

export async function toggleBrandItemStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID nhãn hàng không hợp lệ.',
        data: null,
      });
    }

    const updated = await toggleBrandStatus(id, Number(is_active) ? 1 : 0);

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhãn hàng để đổi trạng thái.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Đổi trạng thái nhãn hàng thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi toggleBrandItemStatus:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đổi trạng thái nhãn hàng.',
      data: null,
    });
  }
}

export async function getCategoryList(req, res) {
  try {
    const keyword = req.query.keyword || '';
    const status = req.query.status || 'all';
    const categories = await getCategories({ keyword, status });

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách danh mục thành công.',
      data: categories,
    });
  } catch (error) {
    console.error('❌ Lỗi getCategoryList:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể lấy danh sách danh mục.',
      data: null,
    });
  }
}

export async function createCategoryItem(req, res) {
  try {
    const { category_name, description } = req.body;

    if (!category_name || !String(category_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu category_name.',
        data: null,
      });
    }

    const created = await createCategory({
      categoryName: String(category_name).trim(),
      description: description || null,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Tạo danh mục thành công.',
      data: created,
    });
  } catch (error) {
    console.error('❌ Lỗi createCategoryItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể tạo danh mục.'),
      data: null,
    });
  }
}

export async function updateCategoryItem(req, res) {
  try {
    const id = Number(req.params.id);
    const { category_name, description } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID danh mục không hợp lệ.',
        data: null,
      });
    }

    if (!category_name || !String(category_name).trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu category_name.',
        data: null,
      });
    }

    const updated = await updateCategory(id, {
      categoryName: String(category_name).trim(),
      description: description || null,
    });

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục để cập nhật.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật danh mục thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi updateCategoryItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể cập nhật danh mục.'),
      data: null,
    });
  }
}

export async function toggleCategoryItemStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { is_active } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID danh mục không hợp lệ.',
        data: null,
      });
    }

    const updated = await toggleCategoryStatus(id, Number(is_active) ? 1 : 0);

    if (!updated) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục để đổi trạng thái.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Đổi trạng thái danh mục thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi toggleCategoryItemStatus:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đổi trạng thái danh mục.',
      data: null,
    });
  }
}

export async function deleteBrandItem(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID nhãn hàng không hợp lệ.',
        data: null,
      });
    }

    const deleted = await deleteBrandById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy nhãn hàng để xóa.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xóa nhãn hàng thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi deleteBrandItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể xóa nhãn hàng.'),
      data: null,
    });
  }
}

export async function deleteCategoryItem(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ID danh mục không hợp lệ.',
        data: null,
      });
    }

    const deleted = await deleteCategoryById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy danh mục để xóa.',
        data: null,
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Xóa danh mục thành công.',
      data: { id },
    });
  } catch (error) {
    console.error('❌ Lỗi deleteCategoryItem:', error);

    return res.status(500).json({
      status: 'error',
      message: normalizeDbErrorMessage(error, 'Không thể xóa danh mục.'),
      data: null,
    });
  }
}
