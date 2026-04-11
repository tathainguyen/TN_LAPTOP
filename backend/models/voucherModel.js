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

export async function getAvailableVouchersForCheckout(orderAmount = 0, userId = null) {
  const normalizedUserId = Number(userId || 0);
  const hasUser = Number.isInteger(normalizedUserId) && normalizedUserId > 0;

  const [rows] = await pool.query(
    `SELECT
      v.id,
      v.code,
      v.voucher_name,
      v.description,
      v.discount_type,
      v.discount_value,
      v.max_discount_value,
      v.min_order_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active
    FROM vouchers v
    ${hasUser ? 'INNER JOIN user_vouchers uv ON uv.voucher_id = v.id AND uv.user_id = ? AND uv.voucher_status = \'AVAILABLE\'' : ''}
    WHERE v.is_active = 1
      AND v.start_at <= NOW()
      AND v.end_at >= NOW()
      AND (v.total_usage_limit IS NULL OR v.used_count < v.total_usage_limit)
    ORDER BY v.end_at ASC, v.id DESC
    LIMIT 50`,
    hasUser ? [normalizedUserId] : []
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

export async function getUserSavedVoucherByCodeForCheckout({ userId, code }) {
  const normalizedUserId = Number(userId || 0);
  const normalizedCode = String(code || '').trim().toUpperCase();

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0 || !normalizedCode) {
    return null;
  }

  const [rows] = await pool.query(
    `SELECT
      v.id,
      v.code,
      v.voucher_name,
      v.description,
      v.discount_type,
      v.discount_value,
      v.max_discount_value,
      v.min_order_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active
    FROM vouchers v
    INNER JOIN user_vouchers uv
      ON uv.voucher_id = v.id
      AND uv.user_id = ?
      AND uv.voucher_status = 'AVAILABLE'
    WHERE v.code = ?
    LIMIT 1`,
    [normalizedUserId, normalizedCode]
  );

  return rows[0] || null;
}

export async function getStorefrontVouchers({ userId = null } = {}) {
  const normalizedUserId = Number(userId || 0);
  const hasUser = Number.isInteger(normalizedUserId) && normalizedUserId > 0;

  const [rows] = await pool.query(
    `SELECT
      v.id,
      v.code,
      v.voucher_name,
      v.description,
      v.discount_type,
      v.discount_value,
      v.max_discount_value,
      v.min_order_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active,
      uv.id AS user_voucher_id,
      uv.voucher_status
    FROM vouchers v
    LEFT JOIN user_vouchers uv
      ON uv.voucher_id = v.id
      AND uv.user_id = ?
    WHERE v.is_active = 1
      AND v.start_at <= NOW()
      AND v.end_at >= NOW()
      AND (v.total_usage_limit IS NULL OR v.used_count < v.total_usage_limit)
    ORDER BY v.end_at ASC, v.id DESC
    LIMIT 100`,
    [hasUser ? normalizedUserId : 0]
  );

  return rows.map((voucher) => {
    const limit = voucher.total_usage_limit === null
      ? null
      : Number(voucher.total_usage_limit || 0);
    const used = Math.max(0, Number(voucher.used_count || 0));
    const usagePercent = limit && limit > 0
      ? Math.min(100, Number(((used / limit) * 100).toFixed(1)))
      : 0;

    return {
      ...voucher,
      usage_percent: usagePercent,
      is_saved: Number(voucher.user_voucher_id || 0) > 0
        && String(voucher.voucher_status || '').toUpperCase() === 'AVAILABLE',
    };
  });
}

export async function saveVoucherToUserWallet({ userId, voucherId = null, code = null }) {
  const normalizedUserId = Number(userId || 0);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error('INVALID_USER');
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query(
      'SELECT id FROM users WHERE id = ? LIMIT 1',
      [normalizedUserId]
    );

    if (userRows.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }

    let voucher = null;

    if (voucherId !== null && voucherId !== undefined) {
      const normalizedVoucherId = Number(voucherId || 0);
      const [voucherRows] = await connection.query(
        `SELECT
          id,
          code,
          voucher_name,
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
        WHERE id = ?
        LIMIT 1
        FOR UPDATE`,
        [normalizedVoucherId]
      );

      voucher = voucherRows[0] || null;
    } else {
      const normalizedCode = String(code || '').trim().toUpperCase();
      if (!normalizedCode) {
        throw new Error('INVALID_VOUCHER');
      }

      const [voucherRows] = await connection.query(
        `SELECT
          id,
          code,
          voucher_name,
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
        [normalizedCode]
      );

      voucher = voucherRows[0] || null;
    }

    if (!voucher) {
      throw new Error('VOUCHER_NOT_FOUND');
    }

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

    const [existingRows] = await connection.query(
      `SELECT id, voucher_status
      FROM user_vouchers
      WHERE user_id = ? AND voucher_id = ?
      LIMIT 1
      FOR UPDATE`,
      [normalizedUserId, Number(voucher.id)]
    );

    const existing = existingRows[0] || null;
    if (existing && String(existing.voucher_status || '').toUpperCase() === 'AVAILABLE') {
      await connection.commit();

      return {
        voucher_id: Number(voucher.id),
        code: voucher.code,
        is_saved: true,
        already_saved: true,
      };
    }

    if (existing) {
      await connection.query(
        `UPDATE user_vouchers
        SET
          voucher_status = 'AVAILABLE',
          order_id = NULL,
          used_at = NULL,
          assigned_at = NOW()
        WHERE id = ?`,
        [Number(existing.id)]
      );
    } else {
      await connection.query(
        `INSERT INTO user_vouchers (
          user_id,
          voucher_id,
          order_id,
          voucher_status,
          assigned_at,
          used_at
        ) VALUES (?, ?, NULL, 'AVAILABLE', NOW(), NULL)`,
        [normalizedUserId, Number(voucher.id)]
      );
    }

    await connection.commit();

    return {
      voucher_id: Number(voucher.id),
      code: voucher.code,
      is_saved: true,
      already_saved: false,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getUserVoucherWallet(userId) {
  const normalizedUserId = Number(userId || 0);
  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    return [];
  }

  const [rows] = await pool.query(
    `SELECT
      uv.id AS user_voucher_id,
      uv.user_id,
      uv.voucher_status,
      uv.assigned_at,
      uv.used_at,
      uv.created_at,
      v.id AS voucher_id,
      v.code,
      v.voucher_name,
      v.description,
      v.discount_type,
      v.discount_value,
      v.max_discount_value,
      v.min_order_value,
      v.total_usage_limit,
      v.used_count,
      v.start_at,
      v.end_at,
      v.is_active
    FROM user_vouchers uv
    INNER JOIN vouchers v ON v.id = uv.voucher_id
    WHERE uv.user_id = ?
    ORDER BY uv.assigned_at DESC, uv.id DESC`,
    [normalizedUserId]
  );

  return rows.map((voucher) => {
    const now = new Date();
    const endAt = new Date(voucher.end_at);
    const status = String(voucher.voucher_status || '').toUpperCase();

    let displayStatus = status;
    if (status === 'AVAILABLE' && !Number.isNaN(endAt.getTime()) && now > endAt) {
      displayStatus = 'EXPIRED';
    }

    return {
      ...voucher,
      display_status: displayStatus,
      is_active_for_use: displayStatus === 'AVAILABLE' && Number(voucher.is_active) === 1,
    };
  });
}
