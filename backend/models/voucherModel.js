import { pool } from '../config/db.js';

export async function getVoucherTypesAdmin() {
  const [rows] = await pool.query(
    `SELECT
      id,
      type_name,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      is_active,
      created_at,
      updated_at
    FROM voucher_types
    ORDER BY id DESC`
  );

  return rows;
}

export async function createVoucherType(payload) {
  const [result] = await pool.query(
    `INSERT INTO voucher_types (
      type_name,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      is_active
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      String(payload.type_name || '').trim(),
      String(payload.discount_type || '').trim().toUpperCase(),
      Number(payload.discount_value || 0),
      Number(payload.min_order_value || 0),
      payload.max_discount_value === null || payload.max_discount_value === undefined || payload.max_discount_value === ''
        ? null
        : Number(payload.max_discount_value),
      Number(payload.is_active) ? 1 : 0,
    ]
  );

  const [rows] = await pool.query('SELECT * FROM voucher_types WHERE id = ? LIMIT 1', [Number(result.insertId)]);
  return rows[0] || null;
}

export async function updateVoucherTypeById(id, payload) {
  const typeId = Number(id);
  const updates = [];
  const params = [];

  if (payload.type_name !== undefined) {
    updates.push('type_name = ?');
    params.push(String(payload.type_name || '').trim());
  }

  if (payload.discount_type !== undefined) {
    updates.push('discount_type = ?');
    params.push(String(payload.discount_type || '').trim().toUpperCase());
  }

  if (payload.discount_value !== undefined) {
    updates.push('discount_value = ?');
    params.push(Number(payload.discount_value || 0));
  }

  if (payload.min_order_value !== undefined) {
    updates.push('min_order_value = ?');
    params.push(Number(payload.min_order_value || 0));
  }

  if (payload.max_discount_value !== undefined) {
    updates.push('max_discount_value = ?');
    params.push(
      payload.max_discount_value === null || payload.max_discount_value === ''
        ? null
        : Number(payload.max_discount_value)
    );
  }

  if (payload.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(Number(payload.is_active) ? 1 : 0);
  }

  if (updates.length > 0) {
    await pool.query(
      `UPDATE voucher_types
      SET ${updates.join(', ')}
      WHERE id = ?`,
      [...params, typeId]
    );
  }

  const [rows] = await pool.query('SELECT * FROM voucher_types WHERE id = ? LIMIT 1', [typeId]);
  return rows[0] || null;
}

export async function deleteVoucherTypeById(id) {
  const typeId = Number(id);
  const [result] = await pool.query('DELETE FROM voucher_types WHERE id = ? LIMIT 1', [typeId]);
  return Number(result?.affectedRows || 0) > 0;
}

async function getVoucherTypeById(id) {
  const [rows] = await pool.query(
    `SELECT
      id,
      type_name,
      discount_type,
      discount_value,
      min_order_value,
      max_discount_value,
      is_active
    FROM voucher_types
    WHERE id = ?
    LIMIT 1`,
    [Number(id)]
  );

  return rows[0] || null;
}

export async function getVouchersAdmin() {
  const [rows] = await pool.query(
    `SELECT
      v.id,
      v.code,
      v.voucher_type_id,
      vt.type_name,
      vt.discount_type,
      vt.discount_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active,
      v.created_at,
      v.updated_at
    FROM vouchers v
    LEFT JOIN voucher_types vt ON vt.id = v.voucher_type_id
    ORDER BY v.id DESC`
  );

  return rows;
}

export async function createVoucherCode(payload) {
  const voucherTypeId = Number(payload.voucher_type_id || 0);
  const voucherType = await getVoucherTypeById(voucherTypeId);

  if (!voucherType) {
    return null;
  }

  const code = String(payload.code || '').trim().toUpperCase();
  const usageLimit = Number(payload.total_usage_limit || 0);
  const isActive = Number(payload.is_active) ? 1 : 0;

  const [result] = await pool.query(
    `INSERT INTO vouchers (
      code,
      voucher_name,
      description,
      discount_type,
      discount_value,
      max_discount_value,
      min_order_value,
      total_usage_limit,
      used_count,
      start_at,
      end_at,
      is_active,
      created_by,
      voucher_type_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      code,
      voucherType.type_name,
      `Mã khuyến mãi ${code}`,
      voucherType.discount_type,
      Number(voucherType.discount_value || 0),
      voucherType.max_discount_value === null ? null : Number(voucherType.max_discount_value),
      Number(voucherType.min_order_value || 0),
      usageLimit,
      0,
      payload.start_at,
      payload.end_at,
      isActive,
      null,
      voucherTypeId,
    ]
  );

  const [rows] = await pool.query(
    `SELECT
      v.id,
      v.code,
      v.voucher_type_id,
      vt.type_name,
      vt.discount_type,
      vt.discount_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active,
      v.created_at,
      v.updated_at
    FROM vouchers v
    LEFT JOIN voucher_types vt ON vt.id = v.voucher_type_id
    WHERE v.id = ?
    LIMIT 1`,
    [Number(result.insertId)]
  );

  return rows[0] || null;
}

export async function updateVoucherCodeById(id, payload) {
  const voucherId = Number(id);
  const updates = [];
  const params = [];

  let voucherType = null;
  if (payload.voucher_type_id !== undefined) {
    voucherType = await getVoucherTypeById(Number(payload.voucher_type_id || 0));
    if (!voucherType) {
      return null;
    }

    updates.push('voucher_type_id = ?');
    params.push(Number(payload.voucher_type_id));

    updates.push('voucher_name = ?');
    params.push(voucherType.type_name);

    updates.push('discount_type = ?');
    params.push(voucherType.discount_type);

    updates.push('discount_value = ?');
    params.push(Number(voucherType.discount_value || 0));

    updates.push('max_discount_value = ?');
    params.push(voucherType.max_discount_value === null ? null : Number(voucherType.max_discount_value));

    updates.push('min_order_value = ?');
    params.push(Number(voucherType.min_order_value || 0));
  }

  if (payload.code !== undefined) {
    updates.push('code = ?');
    params.push(String(payload.code || '').trim().toUpperCase());
  }

  if (payload.total_usage_limit !== undefined) {
    updates.push('total_usage_limit = ?');
    params.push(Number(payload.total_usage_limit || 0));
  }

  if (payload.start_at !== undefined) {
    updates.push('start_at = ?');
    params.push(payload.start_at);
  }

  if (payload.end_at !== undefined) {
    updates.push('end_at = ?');
    params.push(payload.end_at);
  }

  if (payload.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(Number(payload.is_active) ? 1 : 0);
  }

  if (updates.length > 0) {
    await pool.query(
      `UPDATE vouchers
      SET ${updates.join(', ')}
      WHERE id = ?`,
      [...params, voucherId]
    );
  }

  const [rows] = await pool.query(
    `SELECT
      v.id,
      v.code,
      v.voucher_type_id,
      vt.type_name,
      vt.discount_type,
      vt.discount_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active,
      v.created_at,
      v.updated_at
    FROM vouchers v
    LEFT JOIN voucher_types vt ON vt.id = v.voucher_type_id
    WHERE v.id = ?
    LIMIT 1`,
    [voucherId]
  );

  return rows[0] || null;
}

export async function deleteVoucherCodeById(id) {
  const voucherId = Number(id);
  const [result] = await pool.query('DELETE FROM vouchers WHERE id = ? LIMIT 1', [voucherId]);
  return Number(result?.affectedRows || 0) > 0;
}

export function calculateVoucherDiscountAmount(voucher, orderAmount) {
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

export async function getAvailableVouchersForCheckout(orderAmount = 0) {
  const [rows] = await pool.query(
    `SELECT
      id,
      code,
      voucher_name,
      description,
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
    WHERE is_active = 1
      AND start_at <= NOW()
      AND end_at >= NOW()
      AND (total_usage_limit IS NULL OR used_count < total_usage_limit)
    ORDER BY end_at ASC, id DESC
    LIMIT 50`
  );

  return rows.map((voucher) => {
    const minOrderValue = Math.max(0, Number(voucher.min_order_value || 0));
    const eligibleByOrderAmount = Number(orderAmount || 0) >= minOrderValue;
    const estimatedDiscount = eligibleByOrderAmount
      ? calculateVoucherDiscountAmount(voucher, orderAmount)
      : 0;

    return {
      ...voucher,
      estimated_discount: estimatedDiscount,
      is_eligible: eligibleByOrderAmount && estimatedDiscount > 0,
    };
  });
}

export async function getVoucherByCodeForCheckout(code) {
  const normalizedCode = String(code || '').trim().toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  const [rows] = await pool.query(
    `SELECT
      id,
      code,
      voucher_name,
      description,
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
    LIMIT 1`,
    [normalizedCode]
  );

  return rows[0] || null;
}
