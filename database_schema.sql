SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS tn_laptop_db
	CHARACTER SET utf8mb4
	COLLATE utf8mb4_unicode_ci;

USE tn_laptop_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_rooms;
DROP TABLE IF EXISTS review_replies;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS ghn_shipments;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_status_histories;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS user_vouchers;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS shipping_methods;
DROP TABLE IF EXISTS blog_comments;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS purchase_receipt_items;
DROP TABLE IF EXISTS purchase_receipts;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_specs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_groups;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS user_addresses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE IF NOT EXISTS roles (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	role_name VARCHAR(50) NOT NULL,
	description VARCHAR(255) NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_roles_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	role_id BIGINT UNSIGNED NOT NULL,
	email VARCHAR(255) NOT NULL,
	password_hash VARCHAR(255) NULL,
	full_name VARCHAR(120) NOT NULL,
	phone VARCHAR(20) NULL,
	gender ENUM('MALE', 'FEMALE', 'OTHER') NULL,
	date_of_birth DATE NULL,
	avatar_url VARCHAR(500) NULL,
	email_verified TINYINT(1) NOT NULL DEFAULT 0,
	user_status ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
	google_id VARCHAR(191) NULL,
	facebook_id VARCHAR(191) NULL,
	last_login_at DATETIME NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_users_email (email),
	UNIQUE KEY uk_users_google_id (google_id),
	UNIQUE KEY uk_users_facebook_id (facebook_id),
	KEY idx_users_role_id (role_id),
	CONSTRAINT fk_users_role_id
		FOREIGN KEY (role_id) REFERENCES roles(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_addresses (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	user_id BIGINT UNSIGNED NOT NULL,
	recipient_name VARCHAR(120) NOT NULL,
	recipient_phone VARCHAR(20) NOT NULL,
	province VARCHAR(120) NOT NULL,
	district VARCHAR(120) NOT NULL,
	ward VARCHAR(120) NOT NULL,
	address_line VARCHAR(255) NOT NULL,
	address_note VARCHAR(255) NULL,
	is_default TINYINT(1) NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_user_addresses_user_id (user_id),
	CONSTRAINT fk_user_addresses_user_id
		FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	brand_name VARCHAR(120) NOT NULL,
	slug VARCHAR(150) NOT NULL,
	logo_url VARCHAR(500) NULL,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_brands_brand_name (brand_name),
	UNIQUE KEY uk_brands_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	parent_id BIGINT UNSIGNED NULL,
	category_name VARCHAR(120) NOT NULL,
	slug VARCHAR(150) NOT NULL,
	description TEXT NULL,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_categories_slug (slug),
	KEY idx_categories_parent_id (parent_id),
	CONSTRAINT fk_categories_parent_id
		FOREIGN KEY (parent_id) REFERENCES categories(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_groups (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	category_id BIGINT UNSIGNED NOT NULL,
	brand_id BIGINT UNSIGNED NOT NULL,
	group_name VARCHAR(255) NOT NULL,
	slug VARCHAR(255) NOT NULL,
	short_description VARCHAR(500) NULL,
	description LONGTEXT NULL,
	warranty_months INT UNSIGNED NOT NULL DEFAULT 12,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	is_featured TINYINT(1) NOT NULL DEFAULT 0,
	view_count INT UNSIGNED NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_product_groups_slug (slug),
	KEY idx_product_groups_category_id (category_id),
	KEY idx_product_groups_brand_id (brand_id),
	CONSTRAINT fk_product_groups_category_id
		FOREIGN KEY (category_id) REFERENCES categories(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	CONSTRAINT fk_product_groups_brand_id
		FOREIGN KEY (brand_id) REFERENCES brands(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	group_id BIGINT UNSIGNED NOT NULL,
	product_name VARCHAR(255) NOT NULL,
	slug VARCHAR(255) NOT NULL,
	sku VARCHAR(100) NOT NULL,
	cpu_option VARCHAR(100) NULL,
	ram_option VARCHAR(100) NULL,
	storage_option VARCHAR(100) NULL,
	vga_option VARCHAR(100) NULL,
	color_option VARCHAR(50) NULL,
	price_sale DECIMAL(15,2) NOT NULL,
	price_compare DECIMAL(15,2) NULL,
	stock_quantity INT NOT NULL DEFAULT 0,
	sold_quantity INT NOT NULL DEFAULT 0,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_products_slug (slug),
	UNIQUE KEY uk_products_sku (sku),
	KEY idx_products_group_id (group_id),
	CONSTRAINT fk_products_group_id
		FOREIGN KEY (group_id) REFERENCES product_groups(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_specs (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	product_id BIGINT UNSIGNED NOT NULL,
	spec_name VARCHAR(120) NOT NULL,
	spec_value VARCHAR(500) NOT NULL,
	sort_order INT NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_product_specs_product_id (product_id),
	CONSTRAINT fk_product_specs_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	group_id BIGINT UNSIGNED NULL,
	product_id BIGINT UNSIGNED NULL,
	image_url VARCHAR(500) NOT NULL,
	is_primary TINYINT(1) NOT NULL DEFAULT 0,
	sort_order INT NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_product_images_group_id (group_id),
	KEY idx_product_images_product_id (product_id),
	CONSTRAINT fk_product_images_group_id
		FOREIGN KEY (group_id) REFERENCES product_groups(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_product_images_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS suppliers (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	supplier_name VARCHAR(200) NOT NULL,
	contact_name VARCHAR(120) NULL,
	phone VARCHAR(20) NULL,
	email VARCHAR(255) NULL,
	address TEXT NULL,
	note TEXT NULL,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_suppliers_supplier_name (supplier_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_receipts (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	supplier_id BIGINT UNSIGNED NOT NULL,
	created_by BIGINT UNSIGNED NOT NULL,
	total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
	note TEXT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_purchase_receipts_supplier_id (supplier_id),
	KEY idx_purchase_receipts_created_by (created_by),
	CONSTRAINT fk_purchase_receipts_supplier_id
		FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	CONSTRAINT fk_purchase_receipts_created_by
		FOREIGN KEY (created_by) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS purchase_receipt_items (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	receipt_id BIGINT UNSIGNED NOT NULL,
	product_id BIGINT UNSIGNED NOT NULL,
	quantity INT NOT NULL,
	unit_cost DECIMAL(15,2) NOT NULL,
	line_total DECIMAL(15,2) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_receipt_product (receipt_id, product_id),
	KEY idx_purchase_receipt_items_product_id (product_id),
	CONSTRAINT fk_purchase_receipt_items_receipt_id
		FOREIGN KEY (receipt_id) REFERENCES purchase_receipts(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_purchase_receipt_items_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_movements (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	product_id BIGINT UNSIGNED NOT NULL,
	source_type ENUM('IMPORT', 'ORDER', 'RETURN', 'ADJUST') NOT NULL,
	source_id BIGINT UNSIGNED NULL,
	quantity_change INT NOT NULL,
	note VARCHAR(255) NULL,
	created_by BIGINT UNSIGNED NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_stock_movements_product_id (product_id),
	KEY idx_stock_movements_created_by (created_by),
	CONSTRAINT fk_stock_movements_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	CONSTRAINT fk_stock_movements_created_by
		FOREIGN KEY (created_by) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS banners (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	image_url VARCHAR(500) NOT NULL,
	link_url VARCHAR(500) NULL,
	sort_order INT NOT NULL DEFAULT 0,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	start_at DATETIME NULL,
	end_at DATETIME NULL,
	created_by BIGINT UNSIGNED NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_banners_created_by (created_by),
	CONSTRAINT fk_banners_created_by
		FOREIGN KEY (created_by) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_categories (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	category_name VARCHAR(150) NOT NULL,
	slug VARCHAR(180) NOT NULL,
	description VARCHAR(500) NULL,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_blog_categories_slug (slug),
	UNIQUE KEY uk_blog_categories_name (category_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_posts (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	category_id BIGINT UNSIGNED NOT NULL,
	author_id BIGINT UNSIGNED NOT NULL,
	title VARCHAR(255) NOT NULL,
	slug VARCHAR(255) NOT NULL,
	excerpt VARCHAR(500) NULL,
	content LONGTEXT NOT NULL,
	thumbnail_url VARCHAR(500) NULL,
	is_published TINYINT(1) NOT NULL DEFAULT 0,
	published_at DATETIME NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_blog_posts_slug (slug),
	KEY idx_blog_posts_category_id (category_id),
	KEY idx_blog_posts_author_id (author_id),
	CONSTRAINT fk_blog_posts_category_id
		FOREIGN KEY (category_id) REFERENCES blog_categories(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	CONSTRAINT fk_blog_posts_author_id
		FOREIGN KEY (author_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS blog_comments (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	post_id BIGINT UNSIGNED NOT NULL,
	user_id BIGINT UNSIGNED NOT NULL,
	parent_id BIGINT UNSIGNED NULL,
	content TEXT NOT NULL,
	is_hidden TINYINT(1) NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_blog_comments_post_id (post_id),
	KEY idx_blog_comments_user_id (user_id),
	KEY idx_blog_comments_parent_id (parent_id),
	CONSTRAINT fk_blog_comments_post_id
		FOREIGN KEY (post_id) REFERENCES blog_posts(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_blog_comments_user_id
		FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_blog_comments_parent_id
		FOREIGN KEY (parent_id) REFERENCES blog_comments(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vouchers (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	code VARCHAR(50) NOT NULL,
	voucher_name VARCHAR(150) NOT NULL,
	description VARCHAR(500) NULL,
	discount_type ENUM('PERCENT', 'FIXED') NOT NULL,
	discount_value DECIMAL(15,2) NOT NULL,
	max_discount_value DECIMAL(15,2) NULL,
	min_order_value DECIMAL(15,2) NOT NULL DEFAULT 0,
	total_usage_limit INT UNSIGNED NULL,
	used_count INT UNSIGNED NOT NULL DEFAULT 0,
	start_at DATETIME NOT NULL,
	end_at DATETIME NOT NULL,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_by BIGINT UNSIGNED NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_vouchers_code (code),
	KEY idx_vouchers_created_by (created_by),
	CONSTRAINT fk_vouchers_created_by
		FOREIGN KEY (created_by) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shipping_methods (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	method_name VARCHAR(120) NOT NULL,
	method_code VARCHAR(50) NOT NULL,
	fee DECIMAL(15,2) NOT NULL,
	description VARCHAR(255) NULL,
	sort_order INT NOT NULL DEFAULT 0,
	is_active TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_shipping_methods_code (method_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_vouchers (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	user_id BIGINT UNSIGNED NOT NULL,
	voucher_id BIGINT UNSIGNED NOT NULL,
	order_id BIGINT UNSIGNED NULL,
	voucher_status ENUM('AVAILABLE', 'USED', 'EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
	assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	used_at DATETIME NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_user_vouchers_user_voucher (user_id, voucher_id),
	KEY idx_user_vouchers_voucher_id (voucher_id),
	KEY idx_user_vouchers_order_id (order_id),
	CONSTRAINT fk_user_vouchers_user_id
		FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_user_vouchers_voucher_id
		FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carts (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	user_id BIGINT UNSIGNED NULL,
	session_id VARCHAR(191) NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_carts_user_id (user_id),
	UNIQUE KEY uk_carts_session_id (session_id),
	CONSTRAINT fk_carts_user_id
		FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	cart_id BIGINT UNSIGNED NOT NULL,
	product_id BIGINT UNSIGNED NOT NULL,
	quantity INT NOT NULL DEFAULT 1,
	unit_price DECIMAL(15,2) NOT NULL,
	is_selected TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_cart_items_cart_product (cart_id, product_id),
	KEY idx_cart_items_product_id (product_id),
	CONSTRAINT fk_cart_items_cart_id
		FOREIGN KEY (cart_id) REFERENCES carts(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_cart_items_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	order_code VARCHAR(50) NOT NULL,
	user_id BIGINT UNSIGNED NOT NULL,
	user_address_id BIGINT UNSIGNED NULL,
	recipient_name VARCHAR(120) NOT NULL,
	recipient_phone VARCHAR(20) NOT NULL,
	province VARCHAR(120) NOT NULL,
	district VARCHAR(120) NOT NULL,
	ward VARCHAR(120) NOT NULL,
	address_line VARCHAR(255) NOT NULL,
	address_note VARCHAR(255) NULL,
	shipping_method_id BIGINT UNSIGNED NOT NULL,
	shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
	voucher_id BIGINT UNSIGNED NULL,
	voucher_discount DECIMAL(15,2) NOT NULL DEFAULT 0,
	payment_method ENUM('COD', 'VNPAY') NOT NULL,
	payment_status ENUM('UNPAID', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
	order_status ENUM('PENDING_CONFIRM', 'CONFIRMED', 'SHIPPING', 'SUCCESS', 'CANCELLED') NOT NULL DEFAULT 'PENDING_CONFIRM',
	customer_note VARCHAR(500) NULL,
	tracking_code VARCHAR(120) NULL,
	total_items_amount DECIMAL(15,2) NOT NULL,
	grand_total DECIMAL(15,2) NOT NULL,
	cancelled_by BIGINT UNSIGNED NULL,
	cancel_reason VARCHAR(255) NULL,
	cancelled_at DATETIME NULL,
	confirmed_at DATETIME NULL,
	shipping_at DATETIME NULL,
	completed_at DATETIME NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_orders_order_code (order_code),
	KEY idx_orders_user_id (user_id),
	KEY idx_orders_user_address_id (user_address_id),
	KEY idx_orders_shipping_method_id (shipping_method_id),
	KEY idx_orders_voucher_id (voucher_id),
	KEY idx_orders_cancelled_by (cancelled_by),
	CONSTRAINT fk_orders_user_id
		FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	CONSTRAINT fk_orders_user_address_id
		FOREIGN KEY (user_address_id) REFERENCES user_addresses(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	CONSTRAINT fk_orders_shipping_method_id
		FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT,
	CONSTRAINT fk_orders_voucher_id
		FOREIGN KEY (voucher_id) REFERENCES vouchers(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL,
	CONSTRAINT fk_orders_cancelled_by
		FOREIGN KEY (cancelled_by) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE user_vouchers
	ADD CONSTRAINT fk_user_vouchers_order_id
	FOREIGN KEY (order_id) REFERENCES orders(id)
	ON UPDATE CASCADE
	ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS order_items (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	order_id BIGINT UNSIGNED NOT NULL,
	product_id BIGINT UNSIGNED NOT NULL,
	product_name VARCHAR(255) NOT NULL,
	variant_name VARCHAR(255) NOT NULL,
	sku VARCHAR(100) NOT NULL,
	quantity INT NOT NULL,
	unit_price DECIMAL(15,2) NOT NULL,
	line_total DECIMAL(15,2) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_order_items_order_id (order_id),
	KEY idx_order_items_product_id (product_id),
	CONSTRAINT fk_order_items_order_id
		FOREIGN KEY (order_id) REFERENCES orders(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_order_items_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_histories (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	order_id BIGINT UNSIGNED NOT NULL,
	old_status ENUM('PENDING_CONFIRM', 'CONFIRMED', 'SHIPPING', 'SUCCESS', 'CANCELLED') NULL,
	new_status ENUM('PENDING_CONFIRM', 'CONFIRMED', 'SHIPPING', 'SUCCESS', 'CANCELLED') NOT NULL,
	changed_by BIGINT UNSIGNED NULL,
	note VARCHAR(255) NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_order_status_histories_order_id (order_id),
	KEY idx_order_status_histories_changed_by (changed_by),
	CONSTRAINT fk_order_status_histories_order_id
		FOREIGN KEY (order_id) REFERENCES orders(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_order_status_histories_changed_by
		FOREIGN KEY (changed_by) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	order_id BIGINT UNSIGNED NOT NULL,
	provider ENUM('VNPAY', 'COD') NOT NULL,
	transaction_ref VARCHAR(120) NULL,
	bank_code VARCHAR(50) NULL,
	amount DECIMAL(15,2) NOT NULL,
	currency VARCHAR(10) NOT NULL DEFAULT 'VND',
	payment_url VARCHAR(1000) NULL,
	payment_time DATETIME NULL,
	response_code VARCHAR(20) NULL,
	raw_response JSON NULL,
	payment_status ENUM('INIT', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'INIT',
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_payments_order_id (order_id),
	KEY idx_payments_transaction_ref (transaction_ref),
	CONSTRAINT fk_payments_order_id
		FOREIGN KEY (order_id) REFERENCES orders(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ghn_shipments (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	order_id BIGINT UNSIGNED NOT NULL,
	service_id INT NULL,
	from_district_id INT NULL,
	to_district_id INT NULL,
	to_ward_code VARCHAR(30) NULL,
	package_weight INT NULL,
	package_length INT NULL,
	package_width INT NULL,
	package_height INT NULL,
	shipping_order_code VARCHAR(120) NULL,
	expected_delivery_time DATETIME NULL,
	shipping_status VARCHAR(80) NULL,
	raw_request JSON NULL,
	raw_response JSON NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_ghn_shipments_order_id (order_id),
	UNIQUE KEY uk_ghn_shipments_shipping_order_code (shipping_order_code),
	CONSTRAINT fk_ghn_shipments_order_id
		FOREIGN KEY (order_id) REFERENCES orders(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	product_id BIGINT UNSIGNED NOT NULL,
	user_id BIGINT UNSIGNED NOT NULL,
	order_item_id BIGINT UNSIGNED NOT NULL,
	rating TINYINT UNSIGNED NOT NULL,
	review_title VARCHAR(255) NULL,
	review_content TEXT NULL,
	is_verified_purchase TINYINT(1) NOT NULL DEFAULT 1,
	is_hidden TINYINT(1) NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_reviews_order_item_id (order_item_id),
	KEY idx_reviews_product_id (product_id),
	KEY idx_reviews_user_id (user_id),
	CONSTRAINT fk_reviews_product_id
		FOREIGN KEY (product_id) REFERENCES products(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_reviews_user_id
		FOREIGN KEY (user_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_reviews_order_item_id
		FOREIGN KEY (order_item_id) REFERENCES order_items(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_replies (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	review_id BIGINT UNSIGNED NOT NULL,
	admin_id BIGINT UNSIGNED NOT NULL,
	content TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_review_replies_review_id (review_id),
	KEY idx_review_replies_admin_id (admin_id),
	CONSTRAINT fk_review_replies_review_id
		FOREIGN KEY (review_id) REFERENCES reviews(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_review_replies_admin_id
		FOREIGN KEY (admin_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_rooms (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	customer_id BIGINT UNSIGNED NOT NULL,
	admin_id BIGINT UNSIGNED NULL,
	room_status ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
	last_message_at DATETIME NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_chat_rooms_customer_id (customer_id),
	KEY idx_chat_rooms_admin_id (admin_id),
	CONSTRAINT fk_chat_rooms_customer_id
		FOREIGN KEY (customer_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_chat_rooms_admin_id
		FOREIGN KEY (admin_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	room_id BIGINT UNSIGNED NOT NULL,
	sender_id BIGINT UNSIGNED NOT NULL,
	message_type ENUM('TEXT', 'IMAGE', 'SYSTEM') NOT NULL DEFAULT 'TEXT',
	message_content TEXT NOT NULL,
	is_read TINYINT(1) NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_chat_messages_room_id (room_id),
	KEY idx_chat_messages_sender_id (sender_id),
	CONSTRAINT fk_chat_messages_room_id
		FOREIGN KEY (room_id) REFERENCES chat_rooms(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE,
	CONSTRAINT fk_chat_messages_sender_id
		FOREIGN KEY (sender_id) REFERENCES users(id)
		ON UPDATE CASCADE
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (role_name, description)
VALUES
	('ADMIN', 'Quan tri he thong'),
	('CUSTOMER', 'Khach hang mua sam')
ON DUPLICATE KEY UPDATE
	description = VALUES(description),
	updated_at = CURRENT_TIMESTAMP;

INSERT INTO shipping_methods (method_name, method_code, fee, description, sort_order)
VALUES
	('Hoa toc', 'EXPRESS', 50000, 'Giao nhanh trong ngay', 1),
	('Nhanh', 'FAST', 30000, 'Giao nhanh tieu chuan', 2),
	('Tiet kiem', 'SAVING', 20000, 'Giao tiet kiem chi phi', 3)
ON DUPLICATE KEY UPDATE
	method_name = VALUES(method_name),
	fee = VALUES(fee),
	description = VALUES(description),
	sort_order = VALUES(sort_order),
	updated_at = CURRENT_TIMESTAMP;
