import { pool } from '../config/db.js';

function normalizeQuantity(value) {
  const quantity = Number(value || 0);
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.floor(quantity));
}

function resolveUnitPrice(product) {
  const sale = Number(product?.price_sale || 0);
  const compare = Number(product?.price_compare || 0);

  if (compare > 0 && sale > 0 && compare < sale) {
    return compare;
  }

  return sale;
}

export async function getOrCreateCartByUserId(userId, connection = pool) {
  const normalizedUserId = Number(userId);

  const [existingRows] = await connection.query(
    'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
    [normalizedUserId]
  );

  if (existingRows.length > 0) {
    return Number(existingRows[0].id);
  }

  const [insertResult] = await connection.query(
    'INSERT INTO carts (user_id, session_id) VALUES (?, NULL)',
    [normalizedUserId]
  );

  return Number(insertResult.insertId);
}

export async function getCartItemsByUserId(userId) {
  const cartId = await getOrCreateCartByUserId(userId);

  const [rows] = await pool.query(
    `SELECT
      ci.id,
      ci.cart_id,
      ci.product_id,
      ci.quantity,
      ci.unit_price,
      ci.is_selected,
      p.product_name,
      p.slug,
      p.sku,
      p.stock_quantity,
      p.price_sale,
      p.price_compare,
      (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
        LIMIT 1
      ) AS primary_image
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
    ORDER BY ci.created_at ASC, ci.id ASC`,
    [cartId]
  );

  return rows;
}

export async function getProductForCart(productId) {
  const [rows] = await pool.query(
    `SELECT id, product_name, slug, sku, is_active, stock_quantity, price_sale, price_compare
    FROM products
    WHERE id = ?
    LIMIT 1`,
    [Number(productId)]
  );

  return rows[0] || null;
}

export async function addOrIncreaseCartItem({ userId, productId, quantity = 1 }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const normalizedUserId = Number(userId);
    const normalizedProductId = Number(productId);
    const normalizedQuantity = Math.max(1, normalizeQuantity(quantity));

    const product = await getProductForCart(normalizedProductId);
    if (!product || Number(product.is_active) !== 1) {
      throw new Error('PRODUCT_NOT_AVAILABLE');
    }

    const cartId = await getOrCreateCartByUserId(normalizedUserId, connection);

    const [existingRows] = await connection.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
      [cartId, normalizedProductId]
    );

    const unitPrice = resolveUnitPrice(product);

    if (existingRows.length > 0) {
      const currentQty = Number(existingRows[0].quantity || 0);
      const nextQty = currentQty + normalizedQuantity;

      await connection.query(
        'UPDATE cart_items SET quantity = ?, unit_price = ?, updated_at = CURRENT_TIMESTAMP() WHERE id = ?',
        [nextQty, unitPrice, Number(existingRows[0].id)]
      );
    } else {
      await connection.query(
        `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, is_selected)
        VALUES (?, ?, ?, ?, 1)`,
        [cartId, normalizedProductId, normalizedQuantity, unitPrice]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function setCartItemQuantity({ userId, productId, quantity }) {
  const normalizedUserId = Number(userId);
  const normalizedProductId = Number(productId);
  const normalizedQuantity = normalizeQuantity(quantity);
  const cartId = await getOrCreateCartByUserId(normalizedUserId);

  if (normalizedQuantity <= 0) {
    const [deleteResult] = await pool.query(
      'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, normalizedProductId]
    );

    return deleteResult.affectedRows > 0;
  }

  const product = await getProductForCart(normalizedProductId);
  if (!product || Number(product.is_active) !== 1) {
    throw new Error('PRODUCT_NOT_AVAILABLE');
  }

  const unitPrice = resolveUnitPrice(product);
  const [result] = await pool.query(
    `UPDATE cart_items
    SET quantity = ?, unit_price = ?, updated_at = CURRENT_TIMESTAMP()
    WHERE cart_id = ? AND product_id = ?`,
    [normalizedQuantity, unitPrice, cartId, normalizedProductId]
  );

  return result.affectedRows > 0;
}

export async function removeCartItemByProductId({ userId, productId }) {
  const cartId = await getOrCreateCartByUserId(userId);

  const [result] = await pool.query(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, Number(productId)]
  );

  return result.affectedRows > 0;
}

export async function clearCartByUserId(userId) {
  const cartId = await getOrCreateCartByUserId(userId);

  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  return true;
}

export async function syncGuestCartToUser({ userId, items = [] }) {
  const normalizedItems = Array.isArray(items)
    ? items
        .map((item) => ({
          productId: Number(item?.product_id),
          quantity: normalizeQuantity(item?.quantity),
        }))
        .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && item.quantity > 0)
    : [];

  if (normalizedItems.length === 0) {
    return true;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const cartId = await getOrCreateCartByUserId(userId, connection);

    for (const item of normalizedItems) {
      const product = await getProductForCart(item.productId);
      if (!product || Number(product.is_active) !== 1) {
        continue;
      }

      const unitPrice = resolveUnitPrice(product);

      const [existingRows] = await connection.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
        [cartId, item.productId]
      );

      if (existingRows.length > 0) {
        const nextQty = Number(existingRows[0].quantity || 0) + item.quantity;
        await connection.query(
          'UPDATE cart_items SET quantity = ?, unit_price = ?, updated_at = CURRENT_TIMESTAMP() WHERE id = ?',
          [nextQty, unitPrice, Number(existingRows[0].id)]
        );
      } else {
        await connection.query(
          `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, is_selected)
          VALUES (?, ?, ?, ?, 1)`,
          [cartId, item.productId, item.quantity, unitPrice]
        );
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
