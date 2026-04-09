import { pool } from '../config/db.js';

function methodSelectBaseSql() {
  return `SELECT
    sm.id,
    sm.method_name,
    sm.method_code,
    sm.fee,
    sm.description,
    sm.carrier_id,
    c.carrier_name,
    c.carrier_code,
    sm.sort_order,
    sm.is_active,
    sm.created_at,
    sm.updated_at
  FROM shipping_methods sm
  LEFT JOIN shipping_carriers c ON c.id = sm.carrier_id`;
}

export async function getShippingMethodsAdmin() {
  const [rows] = await pool.query(`${methodSelectBaseSql()} ORDER BY sm.sort_order ASC, sm.id ASC`);
  return rows;
}

export async function createShippingMethod(payload) {
  const methodName = String(payload?.method_name || '').trim();
  const methodCode = String(payload?.method_code || '').trim().toUpperCase();
  const description = String(payload?.description || '').trim();
  const fee = Number(payload?.fee || 0);
  const sortOrder = Number(payload?.sort_order || 0);
  const isActive = Number(payload?.is_active) ? 1 : 0;
  const carrierId = payload?.carrier_id ? Number(payload.carrier_id) : null;

  const [result] = await pool.query(
    `INSERT INTO shipping_methods (method_name, method_code, fee, description, carrier_id, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [methodName, methodCode, fee, description || null, carrierId, sortOrder, isActive]
  );

  const [rows] = await pool.query(`${methodSelectBaseSql()} WHERE sm.id = ? LIMIT 1`, [Number(result.insertId)]);
  return rows[0] || null;
}

export async function updateShippingMethodById(id, payload) {
  const methodId = Number(id);
  const updates = [];
  const params = [];

  if (payload.method_name !== undefined) {
    updates.push('method_name = ?');
    params.push(String(payload.method_name || '').trim());
  }

  if (payload.description !== undefined) {
    updates.push('description = ?');
    params.push(String(payload.description || '').trim() || null);
  }

  if (payload.fee !== undefined) {
    updates.push('fee = ?');
    params.push(Number(payload.fee || 0));
  }

  if (payload.carrier_id !== undefined) {
    updates.push('carrier_id = ?');
    params.push(payload.carrier_id ? Number(payload.carrier_id) : null);
  }

  if (payload.sort_order !== undefined) {
    updates.push('sort_order = ?');
    params.push(Number(payload.sort_order || 0));
  }

  if (payload.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(Number(payload.is_active) ? 1 : 0);
  }

  if (updates.length > 0) {
    await pool.query(
      `UPDATE shipping_methods
      SET ${updates.join(', ')}
      WHERE id = ?`,
      [...params, methodId]
    );
  }

  const [rows] = await pool.query(`${methodSelectBaseSql()} WHERE sm.id = ? LIMIT 1`, [methodId]);
  return rows[0] || null;
}

export async function deleteShippingMethodById(id) {
  const methodId = Number(id);
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM shipping_methods');
  const total = Number(countRows?.[0]?.total || 0);

  if (total <= 3) {
    throw new Error('MINIMUM_SHIPPING_METHODS_REQUIRED');
  }

  const [result] = await pool.query('DELETE FROM shipping_methods WHERE id = ? LIMIT 1', [methodId]);
  return Number(result?.affectedRows || 0) > 0;
}

export async function getShippingCarriersAdmin() {
  const [rows] = await pool.query(
    `SELECT
      id,
      carrier_name,
      carrier_code,
      note,
      is_active,
      created_at,
      updated_at
    FROM shipping_carriers
    ORDER BY is_active DESC, carrier_name ASC, id ASC`
  );

  return rows;
}

export async function createShippingCarrier(payload) {
  const name = String(payload?.carrier_name || '').trim();
  const code = String(payload?.carrier_code || '').trim().toUpperCase();
  const note = String(payload?.note || '').trim();
  const isActive = Number(payload?.is_active) ? 1 : 0;

  const [result] = await pool.query(
    `INSERT INTO shipping_carriers (carrier_name, carrier_code, note, is_active)
    VALUES (?, ?, ?, ?)`,
    [name, code, note || null, isActive]
  );

  const [rows] = await pool.query(
    `SELECT
      id,
      carrier_name,
      carrier_code,
      note,
      is_active,
      created_at,
      updated_at
    FROM shipping_carriers
    WHERE id = ?
    LIMIT 1`,
    [Number(result.insertId)]
  );

  return rows[0] || null;
}

export async function updateShippingCarrierById(id, payload) {
  const carrierId = Number(id);
  const updates = [];
  const params = [];

  if (payload.carrier_name !== undefined) {
    updates.push('carrier_name = ?');
    params.push(String(payload.carrier_name || '').trim());
  }

  if (payload.carrier_code !== undefined) {
    updates.push('carrier_code = ?');
    params.push(String(payload.carrier_code || '').trim().toUpperCase());
  }

  if (payload.note !== undefined) {
    updates.push('note = ?');
    params.push(String(payload.note || '').trim() || null);
  }

  if (payload.is_active !== undefined) {
    updates.push('is_active = ?');
    params.push(Number(payload.is_active) ? 1 : 0);
  }

  if (updates.length > 0) {
    await pool.query(
      `UPDATE shipping_carriers
      SET ${updates.join(', ')}
      WHERE id = ?`,
      [...params, carrierId]
    );
  }

  const [rows] = await pool.query(
    `SELECT
      id,
      carrier_name,
      carrier_code,
      note,
      is_active,
      created_at,
      updated_at
    FROM shipping_carriers
    WHERE id = ?
    LIMIT 1`,
    [carrierId]
  );

  return rows[0] || null;
}

export async function deleteShippingCarrierById(id) {
  const carrierId = Number(id);

  await pool.query('UPDATE shipping_methods SET carrier_id = NULL WHERE carrier_id = ?', [carrierId]);

  const [result] = await pool.query('DELETE FROM shipping_carriers WHERE id = ? LIMIT 1', [carrierId]);
  return Number(result?.affectedRows || 0) > 0;
}
