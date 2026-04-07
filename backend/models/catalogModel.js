import { pool } from '../config/db.js';

function toSlug(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(connection, tableName, rawValue, excludeId = null) {
  const base = toSlug(rawValue) || `item-${Date.now()}`;
  let candidate = base;
  let counter = 1;

  while (true) {
    let query = `SELECT id FROM ${tableName} WHERE slug = ?`;
    const params = [candidate];

    if (excludeId) {
      query += ' AND id <> ?';
      params.push(Number(excludeId));
    }

    query += ' LIMIT 1';

    const [rows] = await connection.query(query, params);

    if (rows.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

function buildStatusClause(status, tableAlias = '') {
  const alias = tableAlias ? `${tableAlias}.` : '';

  if (status === 'active') {
    return ` AND ${alias}is_active = 1`;
  }

  if (status === 'inactive') {
    return ` AND ${alias}is_active = 0`;
  }

  return '';
}

export async function getBrands({ keyword = '', status = 'all' } = {}) {
  const whereParts = ['1 = 1'];
  const params = [];

  if (keyword && String(keyword).trim()) {
    whereParts.push('(b.brand_name LIKE ? OR b.slug LIKE ?)');
    const like = `%${String(keyword).trim()}%`;
    params.push(like, like);
  }

  const statusClause = buildStatusClause(status, 'b');
  const [rows] = await pool.query(
    `SELECT
      b.id,
      b.brand_name,
      b.slug,
      b.logo_url,
      b.is_active,
      b.created_at,
      b.updated_at,
      COUNT(p.id) AS product_count
    FROM brands b
    LEFT JOIN product_groups pg ON pg.brand_id = b.id
    LEFT JOIN products p ON p.group_id = pg.id
    WHERE ${whereParts.join(' AND ')}${statusClause}
    GROUP BY b.id, b.brand_name, b.slug, b.logo_url, b.is_active, b.created_at, b.updated_at
    ORDER BY b.created_at DESC`,
    params
  );

  return rows;
}

export async function createBrand({ brandName, logoUrl = null }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slug = await generateUniqueSlug(connection, 'brands', brandName);
    const [result] = await connection.query(
      `INSERT INTO brands (brand_name, slug, logo_url, is_active)
      VALUES (?, ?, ?, 1)`,
      [brandName, slug, logoUrl || null]
    );

    await connection.commit();

    return {
      id: result.insertId,
      slug,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateBrand(id, { brandName, logoUrl = null }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slug = await generateUniqueSlug(connection, 'brands', brandName, id);

    const [result] = await connection.query(
      `UPDATE brands
      SET brand_name = ?, slug = ?, logo_url = COALESCE(?, logo_url)
      WHERE id = ?`,
      [brandName, slug, logoUrl || null, Number(id)]
    );

    await connection.commit();

    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function toggleBrandStatus(id, isActive) {
  const [result] = await pool.query(
    'UPDATE brands SET is_active = ? WHERE id = ?',
    [Number(isActive) ? 1 : 0, Number(id)]
  );

  return result.affectedRows > 0;
}

export async function getCategories({ keyword = '', status = 'all' } = {}) {
  const whereParts = ['1 = 1'];
  const params = [];

  if (keyword && String(keyword).trim()) {
    whereParts.push('(c.category_name LIKE ? OR c.slug LIKE ?)');
    const like = `%${String(keyword).trim()}%`;
    params.push(like, like);
  }

  const statusClause = buildStatusClause(status, 'c');
  const [rows] = await pool.query(
    `SELECT
      c.id,
      c.category_name,
      c.slug,
      c.description,
      c.is_active,
      c.created_at,
      c.updated_at,
      COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN product_groups pg ON pg.category_id = c.id
    LEFT JOIN products p ON p.group_id = pg.id
    WHERE ${whereParts.join(' AND ')}${statusClause}
    GROUP BY c.id, c.category_name, c.slug, c.description, c.is_active, c.created_at, c.updated_at
    ORDER BY c.created_at DESC`,
    params
  );

  return rows;
}

export async function createCategory({ categoryName, description = null }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slug = await generateUniqueSlug(connection, 'categories', categoryName);
    const [result] = await connection.query(
      `INSERT INTO categories (parent_id, category_name, slug, description, is_active)
      VALUES (?, ?, ?, ?, 1)`,
      [null, categoryName, slug, description || null]
    );

    await connection.commit();

    return {
      id: result.insertId,
      slug,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateCategory(
  id,
  { categoryName, description = null }
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slug = await generateUniqueSlug(connection, 'categories', categoryName, id);
    const [result] = await connection.query(
      `UPDATE categories
      SET parent_id = ?, category_name = ?, slug = ?, description = ?
      WHERE id = ?`,
      [null, categoryName, slug, description || null, Number(id)]
    );

    await connection.commit();

    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function toggleCategoryStatus(id, isActive) {
  const [result] = await pool.query(
    'UPDATE categories SET is_active = ? WHERE id = ?',
    [Number(isActive) ? 1 : 0, Number(id)]
  );

  return result.affectedRows > 0;
}

export async function deleteBrandById(id) {
  const [result] = await pool.query('DELETE FROM brands WHERE id = ?', [Number(id)]);

  return result.affectedRows > 0;
}

export async function deleteCategoryById(id) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [Number(id)]);

  return result.affectedRows > 0;
}
