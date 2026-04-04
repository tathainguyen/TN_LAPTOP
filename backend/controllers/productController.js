import {
  getAllProducts,
  getProductBySlug,
} from '../models/productModel.js';

export async function getProducts(req, res) {
  try {
    const products = await getAllProducts();

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
