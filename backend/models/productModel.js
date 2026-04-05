import { pool } from '../config/db.js';

function productSelectSQL() {
  return `SELECT
    p.id,
    p.group_id,
    p.product_name,
    p.slug,
    p.sku,
    p.cpu_option,
    p.ram_option,
    p.storage_option,
    p.vga_option,
    p.color_option,
    p.price_sale,
    p.price_compare,
    p.stock_quantity,
    p.sold_quantity,
    p.is_active,
    p.created_at,
    p.updated_at,
    pg.group_name,
    pg.slug AS group_slug,
    pg.short_description AS group_short_description,
    pg.warranty_months,
    pg.is_featured,
    pg.view_count,
    b.id AS brand_id,
    b.brand_name,
    b.slug AS brand_slug,
    c.id AS category_id,
    c.category_name,
    c.slug AS category_slug,
    (
      SELECT pi.image_url
      FROM product_images pi
      WHERE pi.product_id = p.id
      ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC
      LIMIT 1
    ) AS primary_image
  FROM products p
  INNER JOIN product_groups pg ON p.group_id = pg.id
  INNER JOIN brands b ON pg.brand_id = b.id
  INNER JOIN categories c ON pg.category_id = c.id`;
}

function buildWhereClause({ brandId, categoryId, keyword, groupId }) {
  const conditions = [];
  const params = [];

  if (brandId) {
    conditions.push('b.id = ?');
    params.push(Number(brandId));
  }

  if (categoryId) {
    conditions.push('c.id = ?');
    params.push(Number(categoryId));
  }

  if (groupId) {
    conditions.push('pg.id = ?');
    params.push(Number(groupId));
  }

  if (keyword && String(keyword).trim()) {
    const like = `%${String(keyword).trim()}%`;
    conditions.push('(p.product_name LIKE ? OR p.sku LIKE ? OR pg.group_name LIKE ?)');
    params.push(like, like, like);
  }

  return {
    whereSQL: conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '',
    params,
  };
}

function toSlug(input) {
  return String(input || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(connection, tableName, rawValue) {
  const base = toSlug(rawValue) || `item-${Date.now()}`;
  let candidate = base;
  let counter = 1;

  // Keep trying until no existing row shares the slug.
  while (true) {
    const [rows] = await connection.query(
      `SELECT id FROM ${tableName} WHERE slug = ? LIMIT 1`,
      [candidate]
    );

    if (rows.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${base}-${counter}`;
  }
}

export async function getAllProducts(options = {}) {
  const {
    page = null,
    limit = null,
    brandId = null,
    categoryId = null,
    keyword = '',
    groupId = null,
  } = options;

  const { whereSQL, params } = buildWhereClause({
    brandId,
    categoryId,
    keyword,
    groupId,
  });

  const orderSQL = ' ORDER BY p.created_at DESC';
  const hasPaging = Number.isInteger(page) && page > 0 && Number.isInteger(limit) && limit > 0;

  if (!hasPaging) {
    const [rows] = await pool.query(`${productSelectSQL()}${whereSQL}${orderSQL}`, params);
    return rows;
  }

  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `${productSelectSQL()}${whereSQL}${orderSQL} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
    FROM products p
    INNER JOIN product_groups pg ON p.group_id = pg.id
    INNER JOIN brands b ON pg.brand_id = b.id
    INNER JOIN categories c ON pg.category_id = c.id
    ${whereSQL}`,
    params
  );

  const total = Number(countRows[0]?.total || 0);

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getProductById(id) {
  const [rows] = await pool.query(
    `${productSelectSQL()} WHERE p.id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function getProductImages(productId) {
  const [rows] = await pool.query(
    `SELECT id, image_url, is_primary, sort_order
    FROM product_images
    WHERE product_id = ?
    ORDER BY is_primary DESC, sort_order ASC, id ASC`,
    [productId]
  );

  return rows;
}

export async function getProductBySlug(slug) {
  const [rows] = await pool.query(
    `SELECT
      p.id,
      p.group_id,
      p.product_name,
      p.slug,
      p.sku,
      p.cpu_option,
      p.ram_option,
      p.storage_option,
      p.vga_option,
      p.color_option,
      p.price_sale,
      p.price_compare,
      p.stock_quantity,
      p.sold_quantity,
      p.is_active,
      p.created_at,
      p.updated_at,
      pg.group_name,
      pg.slug AS group_slug,
      pg.short_description AS group_short_description,
      pg.description AS group_description,
      pg.warranty_months,
      pg.is_featured,
      pg.view_count,
      b.id AS brand_id,
      b.brand_name,
      b.slug AS brand_slug,
      c.id AS category_id,
      c.category_name,
      c.slug AS category_slug
    FROM products p
    INNER JOIN product_groups pg ON p.group_id = pg.id
    INNER JOIN brands b ON pg.brand_id = b.id
    INNER JOIN categories c ON pg.category_id = c.id
    WHERE p.slug = ?
    LIMIT 1`,
    [slug]
  );

  return rows[0] || null;
}

export async function getBrands() {
  const [rows] = await pool.query(
    `SELECT id, brand_name, slug
    FROM brands
    WHERE is_active = 1
    ORDER BY brand_name ASC`
  );

  return rows;
}

export async function getCategories() {
  const [rows] = await pool.query(
    `SELECT id, category_name, slug
    FROM categories
    WHERE is_active = 1
    ORDER BY category_name ASC`
  );

  return rows;
}

export async function getProductGroups({ brandId = null, categoryId = null } = {}) {
  const conditions = [];
  const params = [];

  if (brandId) {
    conditions.push('pg.brand_id = ?');
    params.push(Number(brandId));
  }

  if (categoryId) {
    conditions.push('pg.category_id = ?');
    params.push(Number(categoryId));
  }

  const whereSQL = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT
      pg.id,
      pg.group_name,
      pg.slug,
      pg.short_description,
      pg.description,
      pg.warranty_months,
      pg.is_active,
      pg.is_featured,
      pg.brand_id,
      pg.category_id,
      b.brand_name,
      c.category_name
    FROM product_groups pg
    INNER JOIN brands b ON pg.brand_id = b.id
    INNER JOIN categories c ON pg.category_id = c.id
    ${whereSQL}
    ORDER BY pg.created_at DESC`,
    params
  );

  return rows;
}

export async function getProductGroupById(id) {
  const [rows] = await pool.query(
    `SELECT
      pg.id,
      pg.group_name,
      pg.slug,
      pg.short_description,
      pg.description,
      pg.warranty_months,
      pg.is_active,
      pg.is_featured,
      pg.brand_id,
      pg.category_id,
      b.brand_name,
      c.category_name
    FROM product_groups pg
    INNER JOIN brands b ON pg.brand_id = b.id
    INNER JOIN categories c ON pg.category_id = c.id
    WHERE pg.id = ?
    LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function createProductGroup(payload) {
  const {
    brandId,
    categoryId,
    groupName,
    shortDescription,
    description,
    warrantyMonths,
    isFeatured,
  } = payload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slug = await generateUniqueSlug(connection, 'product_groups', groupName);

    const [result] = await connection.query(
      `INSERT INTO product_groups (
        category_id,
        brand_id,
        group_name,
        slug,
        short_description,
        description,
        warranty_months,
        is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(categoryId),
        Number(brandId),
        groupName,
        slug,
        shortDescription || null,
        description || null,
        Number(warrantyMonths || 12),
        Number(isFeatured) ? 1 : 0,
      ]
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

export async function updateProductGroupById(id, payload) {
  const {
    brandId,
    categoryId,
    groupName,
    shortDescription,
    description,
    warrantyMonths,
    isFeatured,
  } = payload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.query(
      'SELECT id, group_name FROM product_groups WHERE id = ? LIMIT 1',
      [id]
    );

    if (existingRows.length === 0) {
      await connection.rollback();
      return false;
    }

    const currentName = String(existingRows[0].group_name || '');
    const nextName = String(groupName || '').trim();

    let slug = null;
    if (nextName && nextName !== currentName) {
      slug = await generateUniqueSlug(connection, 'product_groups', nextName);
    }

    const [result] = await connection.query(
      `UPDATE product_groups
      SET
        category_id = ?,
        brand_id = ?,
        group_name = ?,
        slug = COALESCE(?, slug),
        short_description = ?,
        description = ?,
        warranty_months = ?,
        is_featured = ?
      WHERE id = ?`,
      [
        Number(categoryId),
        Number(brandId),
        nextName,
        slug,
        shortDescription || null,
        description || null,
        Number(warrantyMonths || 12),
        Number(isFeatured) ? 1 : 0,
        id,
      ]
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

export async function updateProductGroupStatusById(id, isActive) {
  const [result] = await pool.query(
    'UPDATE product_groups SET is_active = ? WHERE id = ?',
    [Number(isActive) ? 1 : 0, id]
  );

  return result.affectedRows > 0;
}

export async function countProductsByGroupId(id) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total FROM products WHERE group_id = ?',
    [id]
  );

  return Number(rows[0]?.total || 0);
}

export async function deleteProductGroupById(id) {
  const [result] = await pool.query('DELETE FROM product_groups WHERE id = ?', [id]);

  return result.affectedRows > 0;
}

export async function createProduct(payload) {
  const {
    groupId,
    productName,
    sku,
    cpuOption,
    ramOption,
    storageOption,
    vgaOption,
    colorOption,
    priceSale,
    priceCompare,
    stockQuantity,
    isActive,
    imageUrls = [],
  } = payload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const slug = await generateUniqueSlug(connection, 'products', `${productName}-${sku}`);

    const [result] = await connection.query(
      `INSERT INTO products (
        group_id,
        product_name,
        slug,
        sku,
        cpu_option,
        ram_option,
        storage_option,
        vga_option,
        color_option,
        price_sale,
        price_compare,
        stock_quantity,
        is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(groupId),
        productName,
        slug,
        sku,
        cpuOption || null,
        ramOption || null,
        storageOption || null,
        vgaOption || null,
        colorOption || null,
        Number(priceSale || 0),
        priceCompare !== null && priceCompare !== undefined && priceCompare !== ''
          ? Number(priceCompare)
          : null,
        Number(stockQuantity || 0),
        Number(isActive) ? 1 : 0,
      ]
    );

    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      const cleanUrls = imageUrls
        .map((url) => String(url || '').trim())
        .filter(Boolean);

      for (let index = 0; index < cleanUrls.length; index += 1) {
        const url = cleanUrls[index];
        await connection.query(
          `INSERT INTO product_images (group_id, product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, ?, ?)`,
          [Number(groupId), result.insertId, url, index === 0 ? 1 : 0, index]
        );
      }
    }

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

export async function updateProductById(id, payload) {
  const {
    groupId,
    productName,
    sku,
    cpuOption,
    ramOption,
    storageOption,
    vgaOption,
    colorOption,
    priceSale,
    priceCompare,
    stockQuantity,
    isActive,
    imageUrls = null,
  } = payload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE products
      SET
        group_id = ?,
        product_name = ?,
        sku = ?,
        cpu_option = ?,
        ram_option = ?,
        storage_option = ?,
        vga_option = ?,
        color_option = ?,
        price_sale = ?,
        price_compare = ?,
        stock_quantity = ?,
        is_active = ?
      WHERE id = ?`,
      [
        Number(groupId),
        productName,
        sku,
        cpuOption || null,
        ramOption || null,
        storageOption || null,
        vgaOption || null,
        colorOption || null,
        Number(priceSale || 0),
        priceCompare !== null && priceCompare !== undefined && priceCompare !== ''
          ? Number(priceCompare)
          : null,
        Number(stockQuantity || 0),
        Number(isActive) ? 1 : 0,
        id,
      ]
    );

    if (Array.isArray(imageUrls)) {
      const [productRows] = await connection.query(
        'SELECT group_id FROM products WHERE id = ? LIMIT 1',
        [id]
      );

      const productGroupId = productRows[0]?.group_id || Number(groupId);

      await connection.query('DELETE FROM product_images WHERE product_id = ?', [id]);

      const cleanUrls = imageUrls
        .map((url) => String(url || '').trim())
        .filter(Boolean);

      for (let index = 0; index < cleanUrls.length; index += 1) {
        const url = cleanUrls[index];
        await connection.query(
          `INSERT INTO product_images (group_id, product_id, image_url, is_primary, sort_order)
          VALUES (?, ?, ?, ?, ?)`,
          [productGroupId, id, url, index === 0 ? 1 : 0, index]
        );
      }
    }

    await connection.commit();

    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateProductStatusById(id, isActive) {
  const [result] = await pool.query('UPDATE products SET is_active = ? WHERE id = ?', [
    Number(isActive) ? 1 : 0,
    id,
  ]);

  return result.affectedRows > 0;
}

export async function deleteProductById(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

  return result.affectedRows > 0;
}
