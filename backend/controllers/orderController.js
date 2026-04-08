import {
  createCodOrderFromCart,
  getCheckoutDataByUserId,
  getOrdersByUserId,
} from '../models/orderModel.js';

function parseUserId(value) {
  const userId = Number(value || 0);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

export async function getCheckoutData(req, res) {
  try {
    const userId = parseUserId(req.query.user_id);

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hợp lệ.',
        data: null,
      });
    }

    const checkoutData = await getCheckoutDataByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Lấy dữ liệu checkout thành công.',
      data: checkoutData,
    });
  } catch (error) {
    console.error('❌ Lỗi getCheckoutData:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải dữ liệu checkout.',
      data: null,
    });
  }
}

export async function placeCodOrder(req, res) {
  try {
    const userId = parseUserId(req.body?.user_id);
    const userAddressId = Number(req.body?.user_address_id || 0);
    const shippingMethodId = Number(req.body?.shipping_method_id || 0);
    const customerNote = req.body?.customer_note || null;

    if (!userId || !Number.isInteger(userAddressId) || userAddressId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hoặc user_address_id hợp lệ.',
        data: null,
      });
    }

    if (!Number.isInteger(shippingMethodId) || shippingMethodId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu shipping_method_id hợp lệ.',
        data: null,
      });
    }

    const order = await createCodOrderFromCart({
      userId,
      userAddressId,
      shippingMethodId,
      customerNote,
    });

    return res.status(201).json({
      status: 'success',
      message: 'Đặt hàng COD thành công. Đơn hàng đang chờ xác nhận.',
      data: order,
    });
  } catch (error) {
    if (error?.message === 'INVALID_ADDRESS') {
      return res.status(400).json({
        status: 'error',
        message: 'Địa chỉ giao hàng không hợp lệ.',
        data: null,
      });
    }

    if (error?.message === 'INVALID_SHIPPING_METHOD') {
      return res.status(400).json({
        status: 'error',
        message: 'Phương thức vận chuyển không hợp lệ.',
        data: null,
      });
    }

    if (error?.message === 'CART_EMPTY') {
      return res.status(400).json({
        status: 'error',
        message: 'Giỏ hàng đang trống, không thể đặt hàng.',
        data: null,
      });
    }

    if (error?.message === 'PRODUCT_NOT_AVAILABLE') {
      return res.status(400).json({
        status: 'error',
        message: 'Có sản phẩm trong giỏ đã ngừng kinh doanh.',
        data: null,
      });
    }

    if (error?.message === 'OUT_OF_STOCK') {
      return res.status(400).json({
        status: 'error',
        message: 'Một số sản phẩm trong giỏ không đủ tồn kho.',
        data: null,
      });
    }

    console.error('❌ Lỗi placeCodOrder:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đặt hàng COD lúc này. Vui lòng thử lại sau.',
      data: null,
    });
  }
}

export async function getCustomerOrders(req, res) {
  try {
    const userId = parseUserId(req.query.user_id);

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hợp lệ.',
        data: null,
      });
    }

    const orders = await getOrdersByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Lấy danh sách đơn mua thành công.',
      data: orders,
    });
  } catch (error) {
    console.error('❌ Lỗi getCustomerOrders:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải danh sách đơn mua.',
      data: null,
    });
  }
}
