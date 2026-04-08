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
    const voucherDiscount = 0;
    const grandTotal = totalItemsAmount + shippingFee - voucherDiscount;

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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 'COD', 'UNPAID', 'PENDING_CONFIRM', ?, ?, ?)`,
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

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    await connection.commit();

    return {
      id: orderId,
      order_code: orderCode,
      total_items_amount: totalItemsAmount,
      shipping_fee: shippingFee,
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
