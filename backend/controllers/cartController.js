import {
  addOrIncreaseCartItem,
  clearCartByUserId,
  getCartItemsByUserId,
  removeCartItemByProductId,
  setCartItemQuantity,
  syncGuestCartToUser,
} from '../models/cartModel.js';

function parseUserId(value) {
  const userId = Number(value || 0);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function buildCartSummary(items) {
  const normalizedItems = Array.isArray(items) ? items : [];

  const totalQuantity = normalizedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalAmount = normalizedItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0
  );

  return {
    total_quantity: totalQuantity,
    total_amount: totalAmount,
  };
}

export async function getCart(req, res) {
  try {
    const userId = parseUserId(req.query.user_id);

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hợp lệ.',
        data: null,
      });
    }

    const items = await getCartItemsByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Lấy giỏ hàng thành công.',
      data: {
        items,
        summary: buildCartSummary(items),
      },
    });
  } catch (error) {
    console.error('❌ Lỗi getCart:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể tải giỏ hàng.',
      data: null,
    });
  }
}

export async function addCartItem(req, res) {
  try {
    const userId = parseUserId(req.body?.user_id);
    const productId = Number(req.body?.product_id || 0);
    const quantity = Number(req.body?.quantity || 1);

    if (!userId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hoặc product_id hợp lệ.',
        data: null,
      });
    }

    await addOrIncreaseCartItem({ userId, productId, quantity });

    const items = await getCartItemsByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Đã thêm sản phẩm vào giỏ hàng.',
      data: {
        items,
        summary: buildCartSummary(items),
      },
    });
  } catch (error) {
    if (error?.message === 'PRODUCT_NOT_AVAILABLE') {
      return res.status(400).json({
        status: 'error',
        message: 'Sản phẩm không còn khả dụng để thêm vào giỏ.',
        data: null,
      });
    }

    console.error('❌ Lỗi addCartItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể thêm vào giỏ hàng.',
      data: null,
    });
  }
}

export async function updateCartItem(req, res) {
  try {
    const userId = parseUserId(req.body?.user_id);
    const productId = Number(req.params.productId || 0);
    const quantity = Number(req.body?.quantity || 0);

    if (!userId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hoặc productId hợp lệ.',
        data: null,
      });
    }

    await setCartItemQuantity({ userId, productId, quantity });

    const items = await getCartItemsByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Cập nhật giỏ hàng thành công.',
      data: {
        items,
        summary: buildCartSummary(items),
      },
    });
  } catch (error) {
    if (error?.message === 'PRODUCT_NOT_AVAILABLE') {
      return res.status(400).json({
        status: 'error',
        message: 'Sản phẩm không còn khả dụng trong giỏ hàng.',
        data: null,
      });
    }

    console.error('❌ Lỗi updateCartItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể cập nhật giỏ hàng.',
      data: null,
    });
  }
}

export async function removeCartItem(req, res) {
  try {
    const userId = parseUserId(req.body?.user_id || req.query?.user_id);
    const productId = Number(req.params.productId || 0);

    if (!userId || !Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hoặc productId hợp lệ.',
        data: null,
      });
    }

    await removeCartItemByProductId({ userId, productId });
    const items = await getCartItemsByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Đã xóa sản phẩm khỏi giỏ hàng.',
      data: {
        items,
        summary: buildCartSummary(items),
      },
    });
  } catch (error) {
    console.error('❌ Lỗi removeCartItem:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể xóa sản phẩm khỏi giỏ hàng.',
      data: null,
    });
  }
}

export async function syncGuestCart(req, res) {
  try {
    const userId = parseUserId(req.body?.user_id);
    const items = req.body?.items;

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hợp lệ.',
        data: null,
      });
    }

    await syncGuestCartToUser({ userId, items });
    const mergedItems = await getCartItemsByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Đồng bộ giỏ hàng guest thành công.',
      data: {
        items: mergedItems,
        summary: buildCartSummary(mergedItems),
      },
    });
  } catch (error) {
    console.error('❌ Lỗi syncGuestCart:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể đồng bộ giỏ hàng guest.',
      data: null,
    });
  }
}

export async function clearCart(req, res) {
  try {
    const userId = parseUserId(req.body?.user_id);

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'Thiếu user_id hợp lệ.',
        data: null,
      });
    }

    await clearCartByUserId(userId);

    return res.status(200).json({
      status: 'success',
      message: 'Đã xóa toàn bộ giỏ hàng.',
      data: {
        items: [],
        summary: {
          total_quantity: 0,
          total_amount: 0,
        },
      },
    });
  } catch (error) {
    console.error('❌ Lỗi clearCart:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Không thể xóa toàn bộ giỏ hàng.',
      data: null,
    });
  }
}
