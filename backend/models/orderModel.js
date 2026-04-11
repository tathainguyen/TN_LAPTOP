import { pool } from '../config/db.js';

function buildOrderCode() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `DH${yy}${mm}${dd}${random}`;
}

function buildVariantName(item) {
  const chunks = [item.cpu_option, item.ram_option, item.storage_option, item.vga_option]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  return chunks.length > 0 ? chunks.join(' | ') : item.product_name;
}

function calculateVoucherDiscountAmount(voucher, orderAmount) {
  const normalizedOrderAmount = Math.max(0, Number(orderAmount || 0));
  if (normalizedOrderAmount <= 0 || !voucher) {
    return 0;
  }

  const discountType = String(voucher.discount_type || '').trim().toUpperCase();
  const discountValue = Math.max(0, Number(voucher.discount_value || 0));
  let discountAmount = 0;

  if (discountType === 'PERCENT') {
    discountAmount = (normalizedOrderAmount * discountValue) / 100;
  } else {
    discountAmount = discountValue;
  }

  if (voucher.max_discount_value !== null && voucher.max_discount_value !== undefined) {
    discountAmount = Math.min(discountAmount, Math.max(0, Number(voucher.max_discount_value || 0)));
  }

  discountAmount = Math.min(discountAmount, normalizedOrderAmount);
  return Number(discountAmount.toFixed(2));
}

export async function getCheckoutDataByUserId(userId) {
  const normalizedUserId = Number(userId);

  const [addresses, shippingMethods] = await Promise.all([
    pool.query(
      `SELECT
        id,
        recipient_name,
        recipient_phone,
        province,
        district,
        ward,
        address_line,
        address_note,
        is_default
      FROM user_addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC`,
      [normalizedUserId]
    ),
    pool.query(
      `SELECT id, method_name, method_code, fee, description, sort_order
      FROM shipping_methods
      WHERE is_active = 1
      ORDER BY sort_order ASC, id ASC`
    ),
  ]);

  return {
    addresses: addresses[0] || [],
    shipping_methods: shippingMethods[0] || [],
  };
}

export async function createCodOrderFromCart({
  userId,
  userAddressId,
  shippingMethodId,
  voucherCode = null,
  customerNote = null,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const normalizedUserId = Number(userId);
    const normalizedAddressId = Number(userAddressId);
    const normalizedShippingMethodId = Number(shippingMethodId);

    const [addressRows] = await connection.query(
      `SELECT
        id,
        user_id,
        recipient_name,
        recipient_phone,
        province,
        district,
        ward,
        address_line,
        address_note
      FROM user_addresses
      WHERE id = ? AND user_id = ?
      LIMIT 1`,
      [normalizedAddressId, normalizedUserId]
    );

    if (addressRows.length === 0) {
      throw new Error('INVALID_ADDRESS');
    }

    const [shippingRows] = await connection.query(
      `SELECT id, fee
      FROM shipping_methods
      WHERE id = ? AND is_active = 1
      LIMIT 1`,
      [normalizedShippingMethodId]
    );

    if (shippingRows.length === 0) {
      throw new Error('INVALID_SHIPPING_METHOD');
    }

    const [cartRows] = await connection.query(
      'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
      [normalizedUserId]
    );

    if (cartRows.length === 0) {
      throw new Error('CART_EMPTY');
    }

    const cartId = Number(cartRows[0].id);

    const [cartItemRows] = await connection.query(
      `SELECT
        ci.id,
        ci.product_id,
        ci.quantity,
        ci.unit_price,
        p.product_name,
        p.sku,
        p.stock_quantity,
        p.is_active,
        p.cpu_option,
        p.ram_option,
        p.storage_option,
        p.vga_option
      FROM cart_items ci
      INNER JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at ASC, ci.id ASC`,
      [cartId]
    );

    if (cartItemRows.length === 0) {
      throw new Error('CART_EMPTY');
    }

    for (const item of cartItemRows) {
      if (Number(item.is_active) !== 1) {
        throw new Error('PRODUCT_NOT_AVAILABLE');
      }

      if (Number(item.stock_quantity || 0) < Number(item.quantity || 0)) {
        throw new Error('OUT_OF_STOCK');
      }
    }

    const totalItemsAmount = cartItemRows.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
      0
    );

    const shippingFee = Number(shippingRows[0].fee || 0);
    const normalizedVoucherCode = String(voucherCode || '').trim().toUpperCase();
    let appliedVoucherId = null;
    let voucherDiscount = 0;

    if (normalizedVoucherCode) {
      const [voucherRows] = await connection.query(
        `SELECT
          id,
          code,
          discount_type,
          discount_value,
          max_discount_value,
          min_order_value,
          total_usage_limit,
          used_count,
          start_at,
          end_at,
          is_active
        FROM vouchers
        WHERE code = ?
        LIMIT 1
        FOR UPDATE`,
        [normalizedVoucherCode]
      );

      if (voucherRows.length === 0) {
        throw new Error('INVALID_VOUCHER');
      }

      const voucher = voucherRows[0];
      if (Number(voucher.is_active) !== 1) {
        throw new Error('VOUCHER_NOT_ACTIVE');
      }

      const now = new Date();
      const startAt = new Date(voucher.start_at);
      const endAt = new Date(voucher.end_at);

      if (!Number.isNaN(startAt.getTime()) && now < startAt) {
        throw new Error('VOUCHER_NOT_STARTED');
      }

      if (!Number.isNaN(endAt.getTime()) && now > endAt) {
        throw new Error('VOUCHER_EXPIRED');
      }

      const usageLimit = voucher.total_usage_limit === null
        ? null
        : Number(voucher.total_usage_limit || 0);

      if (usageLimit !== null && Number(voucher.used_count || 0) >= usageLimit) {
        throw new Error('VOUCHER_USAGE_EXCEEDED');
      }

      const minOrderValue = Math.max(0, Number(voucher.min_order_value || 0));
      if (totalItemsAmount < minOrderValue) {
        throw new Error('VOUCHER_MIN_ORDER_NOT_MET');
      }

      voucherDiscount = calculateVoucherDiscountAmount(voucher, totalItemsAmount);
      if (voucherDiscount <= 0) {
        throw new Error('INVALID_VOUCHER');
      }

      appliedVoucherId = Number(voucher.id);

      const [savedVoucherRows] = await connection.query(
        `SELECT id
        FROM user_vouchers
        WHERE user_id = ?
          AND voucher_id = ?
          AND voucher_status = 'AVAILABLE'
        LIMIT 1
        FOR UPDATE`,
        [normalizedUserId, appliedVoucherId]
      );

      if (savedVoucherRows.length === 0) {
        throw new Error('VOUCHER_NOT_SAVED');
      }
    }

    const grandTotal = Math.max(0, totalItemsAmount + shippingFee - voucherDiscount);

    const address = addressRows[0];
    const orderCode = buildOrderCode();

    const [orderInsert] = await connection.query(
      `INSERT INTO orders (
        order_code,
        user_id,
        user_address_id,
        recipient_name,
        recipient_phone,
        province,
        district,
        ward,
        address_line,
        address_note,
        shipping_method_id,
        shipping_fee,
        voucher_id,
        voucher_discount,
        payment_method,
        payment_status,
        order_status,
        customer_note,
        total_items_amount,
        grand_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COD', 'UNPAID', 'PENDING_CONFIRM', ?, ?, ?)`,
      [
        orderCode,
        normalizedUserId,
        normalizedAddressId,
        address.recipient_name,
        address.recipient_phone,
        address.province,
        address.district,
        address.ward,
        address.address_line,
        address.address_note || null,
        normalizedShippingMethodId,
        shippingFee,
        appliedVoucherId,
        voucherDiscount,
        customerNote ? String(customerNote).trim() : null,
        totalItemsAmount,
        grandTotal,
      ]
    );

    const orderId = Number(orderInsert.insertId);

    for (const item of cartItemRows) {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unit_price || 0);
      const lineTotal = quantity * unitPrice;

      await connection.query(
        `INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          variant_name,
          sku,
          quantity,
          unit_price,
          line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          Number(item.product_id),
          item.product_name,
          buildVariantName(item),
          item.sku,
          quantity,
          unitPrice,
          lineTotal,
        ]
      );

      await connection.query(
        `UPDATE products
        SET stock_quantity = stock_quantity - ?, sold_quantity = sold_quantity + ?
        WHERE id = ?`,
        [quantity, quantity, Number(item.product_id)]
      );

      await connection.query(
        `INSERT INTO stock_movements (
          product_id,
          source_type,
          source_id,
          quantity_change,
          note,
          created_by
        ) VALUES (?, 'ORDER', ?, ?, ?, NULL)`,
        [
          Number(item.product_id),
          orderId,
          -quantity,
          `Tru kho tu don hang ${orderCode}`,
        ]
      );
    }

    if (appliedVoucherId) {
      await connection.query(
        `UPDATE vouchers
        SET used_count = used_count + 1
        WHERE id = ?`,
        [appliedVoucherId]
      );

      await connection.query(
        `UPDATE user_vouchers
        SET
          voucher_status = 'USED',
          order_id = ?,
          used_at = NOW()
        WHERE user_id = ?
          AND voucher_id = ?
          AND voucher_status = 'AVAILABLE'
        LIMIT 1`,
        [orderId, normalizedUserId, appliedVoucherId]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();

    return {
      id: orderId,
      order_code: orderCode,
      total_items_amount: totalItemsAmount,
      shipping_fee: shippingFee,
      voucher_discount: voucherDiscount,
      voucher_id: appliedVoucherId,
      grand_total: grandTotal,
      payment_method: 'COD',
      order_status: 'PENDING_CONFIRM',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getOrdersByUserId(userId) {
  const normalizedUserId = Number(userId);

  const [rows] = await pool.query(
    `SELECT
      o.id,
      o.order_code,
      o.created_at,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.total_items_amount,
      o.shipping_fee,
      o.grand_total,
      o.tracking_code,
      (
        SELECT COUNT(*)
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS item_count
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC, o.id DESC`,
    [normalizedUserId]
  );

  return rows;
}

export async function getOrderDetailByUserId({ userId, orderId }) {
  const normalizedUserId = Number(userId);
  const normalizedOrderId = Number(orderId);

  const [orderRows] = await pool.query(
    `SELECT
      o.id,
      o.order_code,
      o.user_id,
      o.user_address_id,
      o.recipient_name,
      o.recipient_phone,
      o.province,
      o.district,
      o.ward,
      o.address_line,
      o.address_note,
      o.shipping_method_id,
      sm.method_name AS shipping_method_name,
      sm.method_code AS shipping_method_code,
      o.shipping_fee,
      o.voucher_id,
      v.code AS voucher_code,
      o.voucher_discount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.customer_note,
      o.total_items_amount,
      o.grand_total,
      o.tracking_code,
      o.created_at,
      o.updated_at
    FROM orders o
    LEFT JOIN shipping_methods sm ON sm.id = o.shipping_method_id
    LEFT JOIN vouchers v ON v.id = o.voucher_id
    WHERE o.id = ? AND o.user_id = ?
    LIMIT 1`,
    [normalizedOrderId, normalizedUserId]
  );

  if (orderRows.length === 0) {
    return null;
  }

  const [itemRows] = await pool.query(
    `SELECT
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.product_name,
      oi.variant_name,
      oi.sku,
      oi.quantity,
      oi.unit_price,
      oi.line_total,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = oi.product_id
        ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS primary_image
    FROM order_items oi
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC`,
    [normalizedOrderId]
  );

  return {
    ...orderRows[0],
    items: itemRows,
    item_count: itemRows.length,
  };
}

export async function getAdminOrderDetailById(orderId) {
  const normalizedOrderId = Number(orderId);

  const [orderRows] = await pool.query(
    `SELECT
      o.id,
      o.order_code,
      o.user_id,
      u.full_name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      o.user_address_id,
      o.recipient_name,
      o.recipient_phone,
      o.province,
      o.district,
      o.ward,
      o.address_line,
      o.address_note,
      o.shipping_method_id,
      sm.method_name AS shipping_method_name,
      sm.method_code AS shipping_method_code,
      o.shipping_fee,
      o.voucher_id,
      v.code AS voucher_code,
      o.voucher_discount,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.customer_note,
      o.total_items_amount,
      o.grand_total,
      o.tracking_code,
      o.created_at,
      o.updated_at
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    LEFT JOIN shipping_methods sm ON sm.id = o.shipping_method_id
    LEFT JOIN vouchers v ON v.id = o.voucher_id
    WHERE o.id = ?
    LIMIT 1`,
    [normalizedOrderId]
  );

  if (orderRows.length === 0) {
    return null;
  }

  const [itemRows] = await pool.query(
    `SELECT
      oi.id,
      oi.order_id,
      oi.product_id,
      oi.product_name,
      oi.variant_name,
      oi.sku,
      oi.quantity,
      oi.unit_price,
      oi.line_total,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = oi.product_id
        ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS primary_image
    FROM order_items oi
    WHERE oi.order_id = ?
    ORDER BY oi.id ASC`,
    [normalizedOrderId]
  );

  const [historyRows] = await pool.query(
    `SELECT
      h.id,
      h.old_status,
      h.new_status,
      h.note,
      h.created_at,
      h.changed_by,
      u.full_name AS changed_by_name
    FROM order_status_histories h
    LEFT JOIN users u ON u.id = h.changed_by
    WHERE h.order_id = ?
    ORDER BY h.created_at DESC, h.id DESC`,
    [normalizedOrderId]
  );

  return {
    ...orderRows[0],
    items: itemRows,
    item_count: itemRows.length,
    status_histories: historyRows,
  };
}

export async function getAdminOrders({
  page = 1,
  limit = 10,
  keyword = '',
  orderStatus = '',
  paymentStatus = '',
}) {
  const normalizedPage = Number(page) > 0 ? Number(page) : 1;
  const normalizedLimit = Number(limit) > 0 ? Number(limit) : 10;
  const offset = (normalizedPage - 1) * normalizedLimit;

  const conditions = [];
  const params = [];

  const keywordText = String(keyword || '').trim();
  if (keywordText) {
    conditions.push('(o.order_code LIKE ? OR o.recipient_name LIKE ? OR o.recipient_phone LIKE ?)');
    const token = `%${keywordText}%`;
    params.push(token, token, token);
  }

  const normalizedOrderStatus = String(orderStatus || '').trim().toUpperCase();
  if (normalizedOrderStatus) {
    conditions.push('o.order_status = ?');
    params.push(normalizedOrderStatus);
  }

  const normalizedPaymentStatus = String(paymentStatus || '').trim().toUpperCase();
  if (normalizedPaymentStatus) {
    conditions.push('o.payment_status = ?');
    params.push(normalizedPaymentStatus);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
      o.id,
      o.order_code,
      o.user_id,
      u.full_name AS customer_name,
      u.email AS customer_email,
      o.recipient_name,
      o.recipient_phone,
      o.payment_method,
      o.payment_status,
      o.order_status,
      o.total_items_amount,
      o.shipping_fee,
      o.grand_total,
      o.created_at,
      o.updated_at,
      (
        SELECT COUNT(*)
        FROM order_items oi
        WHERE oi.order_id = o.id
      ) AS item_count
    FROM orders o
    LEFT JOIN users u ON u.id = o.user_id
    ${whereClause}
    ORDER BY o.created_at DESC, o.id DESC
    LIMIT ? OFFSET ?`,
    [...params, normalizedLimit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
    FROM orders o
    ${whereClause}`,
    params
  );

  const total = Number(countRows?.[0]?.total || 0);

  return {
    items: rows,
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / normalizedLimit)),
    },
  };
}

export async function updateOrderStatusById({
  orderId,
  orderStatus,
  changedBy = null,
  note = null,
}) {
  const normalizedOrderId = Number(orderId);
  const normalizedOrderStatus = String(orderStatus || '').trim().toUpperCase();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderRows] = await connection.query(
      'SELECT id, order_status FROM orders WHERE id = ? LIMIT 1',
      [normalizedOrderId]
    );

    if (orderRows.length === 0) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const oldStatus = String(orderRows[0].order_status || '').toUpperCase();

    if (oldStatus === normalizedOrderStatus) {
      await connection.commit();
      return {
        id: normalizedOrderId,
        old_status: oldStatus,
        new_status: normalizedOrderStatus,
      };
    }

    const now = new Date();
    const updates = ['order_status = ?'];
    const updateParams = [normalizedOrderStatus];

    if (normalizedOrderStatus === 'CONFIRMED') {
      updates.push('confirmed_at = ?');
      updateParams.push(now);
    }

    if (normalizedOrderStatus === 'SHIPPING') {
      updates.push('shipping_at = ?');
      updateParams.push(now);
    }

    if (normalizedOrderStatus === 'SUCCESS') {
      updates.push('completed_at = ?');
      updateParams.push(now);
      updates.push("payment_status = CASE WHEN payment_method = 'COD' THEN 'PAID' ELSE payment_status END");
    }

    if (normalizedOrderStatus === 'CANCELLED') {
      updates.push('cancelled_at = ?');
      updateParams.push(now);
      updates.push('cancelled_by = ?');
      updateParams.push(changedBy || null);
      updates.push('cancel_reason = ?');
      updateParams.push(note ? String(note).trim() : null);
    }

    await connection.query(
      `UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = ?`,
      [...updateParams, normalizedOrderId]
    );

    await connection.query(
      `INSERT INTO order_status_histories (
        order_id,
        old_status,
        new_status,
        changed_by,
        note
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        normalizedOrderId,
        oldStatus,
        normalizedOrderStatus,
        changedBy || null,
        note ? String(note).trim() : null,
      ]
    );

    await connection.commit();

    return {
      id: normalizedOrderId,
      old_status: oldStatus,
      new_status: normalizedOrderStatus,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function cancelCustomerOrderById({
  userId,
  orderId,
  note = 'Khach hang huy don',
}) {
  const normalizedUserId = Number(userId);
  const normalizedOrderId = Number(orderId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [orderRows] = await connection.query(
      `SELECT id, user_id, order_status
      FROM orders
      WHERE id = ? AND user_id = ?
      LIMIT 1`,
      [normalizedOrderId, normalizedUserId]
    );

    if (orderRows.length === 0) {
      throw new Error('ORDER_NOT_FOUND');
    }

    const oldStatus = String(orderRows[0].order_status || '').toUpperCase();
    if (oldStatus !== 'PENDING_CONFIRM') {
      throw new Error('ORDER_CANNOT_CANCEL');
    }

    const now = new Date();

    await connection.query(
      `UPDATE orders
      SET
        order_status = 'CANCELLED',
        cancelled_at = ?,
        cancelled_by = ?,
        cancel_reason = ?
      WHERE id = ? AND user_id = ?`,
      [
        now,
        normalizedUserId,
        note ? String(note).trim() : null,
        normalizedOrderId,
        normalizedUserId,
      ]
    );

    await connection.query(
      `INSERT INTO order_status_histories (
        order_id,
        old_status,
        new_status,
        changed_by,
        note
      ) VALUES (?, ?, 'CANCELLED', ?, ?)`,
      [normalizedOrderId, oldStatus, normalizedUserId, note ? String(note).trim() : null]
    );

    await connection.commit();

    return {
      id: normalizedOrderId,
      old_status: oldStatus,
      new_status: 'CANCELLED',
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
