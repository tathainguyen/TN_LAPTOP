import { pool } from '../config/db.js';

export async function getAllProducts() {
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
    ORDER BY p.created_at DESC`
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
