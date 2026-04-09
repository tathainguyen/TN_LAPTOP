-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th4 09, 2026 lúc 09:46 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `tn_laptop_db`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banners`
--

DROP TABLE IF EXISTS `banners`;
CREATE TABLE `banners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `start_at` datetime DEFAULT NULL,
  `end_at` datetime DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
CREATE TABLE `blog_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_name` varchar(150) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blog_comments`
--

DROP TABLE IF EXISTS `blog_comments`;
CREATE TABLE `blog_comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `content` text NOT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
CREATE TABLE `blog_posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `author_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` varchar(500) DEFAULT NULL,
  `content` longtext NOT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `brands`
--

DROP TABLE IF EXISTS `brands`;
CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `brand_name` varchar(120) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `brands`
--

INSERT INTO `brands` (`id`, `brand_name`, `slug`, `logo_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Lenovo', 'lenovo', NULL, 1, '2026-04-04 13:38:51', '2026-04-04 13:38:51'),
(6, 'Hp', 'hp', NULL, 1, '2026-04-04 18:44:16', '2026-04-04 18:48:39'),
(7, 'Dell', 'dell', NULL, 1, '2026-04-05 15:24:03', '2026-04-05 15:24:03'),
(8, 'Asus', 'asus', NULL, 1, '2026-04-06 15:22:20', '2026-04-06 17:46:11');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `carts`
--

DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `session_id` varchar(191) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `session_id`, `created_at`, `updated_at`) VALUES
(1, 6, NULL, '2026-04-08 17:41:51', '2026-04-08 17:41:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `cart_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,2) NOT NULL,
  `is_selected` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `category_name` varchar(120) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `parent_id`, `category_name`, `slug`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Laptop Gaming', 'laptop-gaming', 'Laptop chuyên dụng cho chơi game', 1, '2026-04-04 13:38:51', '2026-04-04 13:38:51'),
(7, NULL, 'Laptop Văn Phòng', 'laptop-văn-phòng', 'Gọn, nhẹ, cấu hình ổn định', 1, '2026-04-04 17:13:48', '2026-04-04 17:13:48'),
(8, NULL, 'Laptop Đồ Họa', 'laptop-đồ-họa', 'Chuyên dụng cho người dùng thiết kế đồ hoạ với độ chuẩn màu lên đến 99%', 1, '2026-04-04 18:44:47', '2026-04-06 16:25:01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `message_type` enum('TEXT','IMAGE','SYSTEM') NOT NULL DEFAULT 'TEXT',
  `message_content` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
CREATE TABLE `chat_rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED DEFAULT NULL,
  `room_status` enum('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
  `last_message_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ghn_shipments`
--

DROP TABLE IF EXISTS `ghn_shipments`;
CREATE TABLE `ghn_shipments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `service_id` int(11) DEFAULT NULL,
  `from_district_id` int(11) DEFAULT NULL,
  `to_district_id` int(11) DEFAULT NULL,
  `to_ward_code` varchar(30) DEFAULT NULL,
  `package_weight` int(11) DEFAULT NULL,
  `package_length` int(11) DEFAULT NULL,
  `package_width` int(11) DEFAULT NULL,
  `package_height` int(11) DEFAULT NULL,
  `shipping_order_code` varchar(120) DEFAULT NULL,
  `expected_delivery_time` datetime DEFAULT NULL,
  `shipping_status` varchar(80) DEFAULT NULL,
  `raw_request` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_request`)),
  `raw_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_response`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_code` varchar(50) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `user_address_id` bigint(20) UNSIGNED DEFAULT NULL,
  `recipient_name` varchar(120) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `province` varchar(120) NOT NULL,
  `district` varchar(120) NOT NULL,
  `ward` varchar(120) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `address_note` varchar(255) DEFAULT NULL,
  `shipping_method_id` bigint(20) UNSIGNED NOT NULL,
  `shipping_fee` decimal(15,2) NOT NULL DEFAULT 0.00,
  `voucher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `voucher_discount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('COD','VNPAY') NOT NULL,
  `payment_status` enum('UNPAID','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'UNPAID',
  `order_status` enum('PENDING_CONFIRM','CONFIRMED','SHIPPING','SUCCESS','CANCELLED') NOT NULL DEFAULT 'PENDING_CONFIRM',
  `customer_note` varchar(500) DEFAULT NULL,
  `tracking_code` varchar(120) DEFAULT NULL,
  `total_items_amount` decimal(15,2) NOT NULL,
  `grand_total` decimal(15,2) NOT NULL,
  `cancelled_by` bigint(20) UNSIGNED DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `shipping_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `user_id`, `user_address_id`, `recipient_name`, `recipient_phone`, `province`, `district`, `ward`, `address_line`, `address_note`, `shipping_method_id`, `shipping_fee`, `voucher_id`, `voucher_discount`, `payment_method`, `payment_status`, `order_status`, `customer_note`, `tracking_code`, `total_items_amount`, `grand_total`, `cancelled_by`, `cancel_reason`, `cancelled_at`, `confirmed_at`, `shipping_at`, `completed_at`, `created_at`, `updated_at`) VALUES
(1, 'DH2604092466', 6, NULL, 'Nguyễn Thái', '0913556699', 'Cần Thơ', 'Quận Cái Răng', 'Phường Lê Bình', '19abc, vĩnh nguyên', 'gọi trước khi đến', 1, 50000.00, NULL, 0.00, 'COD', 'UNPAID', 'PENDING_CONFIRM', NULL, NULL, 257540255000.00, 257540305000.00, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-08 18:01:04', '2026-04-08 18:01:04'),
(2, 'DH2604097175', 6, NULL, 'Nguyễn Thái', '0913556699', 'Cần Thơ', 'Quận Cái Răng', 'Phường Lê Bình', '19abc, vĩnh nguyên', 'gọi trước khi đến', 2, 30000.00, NULL, 0.00, 'COD', 'UNPAID', 'CANCELLED', '123', NULL, 19005000.00, 19035000.00, 1, NULL, '2026-04-09 02:07:20', NULL, NULL, NULL, '2026-04-08 18:13:49', '2026-04-08 19:07:20'),
(3, 'DH2604094916', 6, 7, 'thai', '0913669955', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Yên Hòa', '123', NULL, 3, 20000.00, NULL, 0.00, 'COD', 'UNPAID', 'SHIPPING', 'aaaaa', NULL, 5000.00, 25000.00, NULL, NULL, NULL, '2026-04-09 01:22:11', '2026-04-09 01:38:23', NULL, '2026-04-08 18:15:29', '2026-04-08 18:38:23'),
(4, 'DH2604091486', 6, 6, 'nguyen', '0913778899', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123', NULL, 2, 30000.00, NULL, 0.00, 'COD', 'UNPAID', 'CANCELLED', '123', NULL, 2318005000.00, 2318035000.00, 6, 'Khach hang huy don', '2026-04-10 01:06:45', NULL, NULL, NULL, '2026-04-09 16:14:00', '2026-04-09 18:06:45'),
(5, 'DH2604094757', 6, 7, 'thai', '0913669955', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Yên Hòa', '123', NULL, 1, 50000.00, NULL, 0.00, 'COD', 'UNPAID', 'PENDING_CONFIRM', NULL, NULL, 19000000.00, 19050000.00, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-09 16:46:14', '2026-04-09 16:46:14'),
(6, 'DH2604097532', 6, 7, 'thai', '0913669955', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Yên Hòa', '123', NULL, 1, 50000.00, NULL, 0.00, 'COD', 'UNPAID', 'SHIPPING', NULL, NULL, 5000.00, 55000.00, NULL, NULL, NULL, NULL, '2026-04-10 01:12:24', NULL, '2026-04-09 16:54:19', '2026-04-09 18:12:24'),
(7, 'DH2604091094', 6, 7, 'thai', '0913669955', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Yên Hòa', '123', NULL, 1, 50000.00, NULL, 0.00, 'COD', 'PAID', 'SUCCESS', NULL, NULL, 5000.00, 55000.00, NULL, NULL, NULL, NULL, NULL, '2026-04-10 01:12:16', '2026-04-09 16:54:45', '2026-04-09 18:12:16'),
(8, 'DH2604101480', 6, NULL, 'test', '091354848', 'Hải Phòng', 'Quận Lê Chân', 'Phường An Biên', '123123123123', NULL, 1, 50000.00, NULL, 0.00, 'COD', 'UNPAID', 'CANCELLED', NULL, NULL, 19005000.00, 19055000.00, 6, 'Khach hang huy don', '2026-04-10 00:55:54', NULL, NULL, NULL, '2026-04-09 17:34:09', '2026-04-09 17:55:54'),
(9, 'DH2604105066', 6, 7, 'thai', '0913669955', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Yên Hòa', '123', NULL, 3, 20000.00, NULL, 0.00, 'COD', 'UNPAID', 'PENDING_CONFIRM', NULL, NULL, 255241250000.00, 255241270000.00, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-09 19:41:00', '2026-04-09 19:41:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `variant_name` varchar(255) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `variant_name`, `sku`, `quantity`, `unit_price`, `line_total`, `created_at`) VALUES
(1, 1, 134, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'Xeon 11855M | 32GB | 512GB | RTX A3000 6GB', 'Dell-Precision-7560', 1, 19000000.00, 19000000.00, '2026-04-08 18:01:04'),
(2, 1, 1, 'Lenovo LOQ 15IAX9 (i5-12450HX)', 'Core i5-12450HX | 12GB | RTX 2050 4GB', 'LOQ-I5-2050', 1, 255222250000.00, 255222250000.00, '2026-04-08 18:01:04'),
(3, 1, 2, 'Lenovo LOQ 15IAX9 (i7-13650HX)', 'Core i7-13650HX | 16GB | 256gb | RTX 4050 6GB', 'LOQ-I7-4050', 1, 2299000000.00, 2299000000.00, '2026-04-08 18:01:04'),
(4, 1, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-08 18:01:04'),
(5, 2, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-08 18:13:49'),
(6, 2, 134, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'Xeon 11855M | 32GB | 512GB | RTX A3000 6GB', 'Dell-Precision-7560', 1, 19000000.00, 19000000.00, '2026-04-08 18:13:49'),
(7, 3, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-08 18:15:29'),
(8, 4, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-09 16:14:00'),
(9, 4, 134, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'Xeon 11855M | 32GB | 512GB | RTX A3000 6GB', 'Dell-Precision-7560', 1, 19000000.00, 19000000.00, '2026-04-09 16:14:00'),
(10, 4, 2, 'Lenovo LOQ 15IAX9 (i7-13650HX)', 'Core i7-13650HX | 16GB | 256gb | RTX 4050 6GB', 'LOQ-I7-4050', 1, 2299000000.00, 2299000000.00, '2026-04-09 16:14:00'),
(11, 5, 134, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'Xeon 11855M | 32GB | 512GB | RTX A3000 6GB', 'Dell-Precision-7560', 1, 19000000.00, 19000000.00, '2026-04-09 16:46:14'),
(12, 6, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-09 16:54:19'),
(13, 7, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-09 16:54:45'),
(14, 8, 134, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'Xeon 11855M | 32GB | 512GB | RTX A3000 6GB', 'Dell-Precision-7560', 1, 19000000.00, 19000000.00, '2026-04-09 17:34:09'),
(15, 8, 139, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'Core 5 210H | 16GB | 512GB', 'Asus-TUF-Gaming-F16', 1, 5000.00, 5000.00, '2026-04-09 17:34:09'),
(16, 9, 134, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'Xeon 11855M | 32GB | 512GB | RTX A3000 6GB', 'Dell-Precision-7560', 1, 19000000.00, 19000000.00, '2026-04-09 19:41:00'),
(17, 9, 1, 'Lenovo LOQ 15IAX9 (i5-12450HX)', 'Core i5-12450HX | 12GB | RTX 2050 4GB', 'LOQ-I5-2050', 1, 255222250000.00, 255222250000.00, '2026-04-09 19:41:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_status_histories`
--

DROP TABLE IF EXISTS `order_status_histories`;
CREATE TABLE `order_status_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `old_status` enum('PENDING_CONFIRM','CONFIRMED','SHIPPING','SUCCESS','CANCELLED') DEFAULT NULL,
  `new_status` enum('PENDING_CONFIRM','CONFIRMED','SHIPPING','SUCCESS','CANCELLED') NOT NULL,
  `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_status_histories`
--

INSERT INTO `order_status_histories` (`id`, `order_id`, `old_status`, `new_status`, `changed_by`, `note`, `created_at`) VALUES
(1, 3, 'PENDING_CONFIRM', 'CONFIRMED', 1, NULL, '2026-04-08 18:22:11'),
(2, 3, 'CONFIRMED', 'SHIPPING', 1, NULL, '2026-04-08 18:38:23'),
(3, 2, 'PENDING_CONFIRM', 'CANCELLED', 1, NULL, '2026-04-08 19:07:20'),
(4, 8, 'PENDING_CONFIRM', 'CANCELLED', 6, 'Khach hang huy don', '2026-04-09 17:55:54'),
(5, 4, 'PENDING_CONFIRM', 'CANCELLED', 6, 'Khach hang huy don', '2026-04-09 18:06:45'),
(6, 7, 'PENDING_CONFIRM', 'SUCCESS', 1, NULL, '2026-04-09 18:12:16'),
(7, 6, 'PENDING_CONFIRM', 'SHIPPING', 1, NULL, '2026-04-09 18:12:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `provider` enum('VNPAY','COD') NOT NULL,
  `transaction_ref` varchar(120) DEFAULT NULL,
  `bank_code` varchar(50) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'VND',
  `payment_url` varchar(1000) DEFAULT NULL,
  `payment_time` datetime DEFAULT NULL,
  `response_code` varchar(20) DEFAULT NULL,
  `raw_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_response`)),
  `payment_status` enum('INIT','SUCCESS','FAILED') NOT NULL DEFAULT 'INIT',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `cpu_option` varchar(100) DEFAULT NULL,
  `ram_option` varchar(100) DEFAULT NULL,
  `storage_option` varchar(100) DEFAULT NULL,
  `vga_option` varchar(100) DEFAULT NULL,
  `color_option` varchar(50) DEFAULT NULL,
  `price_sale` decimal(15,2) NOT NULL,
  `price_compare` decimal(15,2) DEFAULT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `sold_quantity` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `group_id`, `product_name`, `slug`, `sku`, `cpu_option`, `ram_option`, `storage_option`, `vga_option`, `color_option`, `price_sale`, `price_compare`, `stock_quantity`, `sold_quantity`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Lenovo LOQ 15IAX9 (i5-12450HX)', 'lenovo-loq-15iax9-i5', 'LOQ-I5-2050', 'Core i5-12450HX', '12GB', NULL, 'RTX 2050 4GB', NULL, 255222250000.00, NULL, 13, 2, 1, '2026-04-04 13:38:51', '2026-04-09 19:41:00'),
(2, 1, 'Lenovo LOQ 15IAX9 (i7-13650HX)', 'lenovo-loq-15iax9-i7', 'LOQ-I7-4050', 'Core i7-13650HX', '16GB', '256gb', 'RTX 4050 6GB', 'xám', 2299000000.00, NULL, 3, 2, 1, '2026-04-04 13:38:51', '2026-04-09 16:14:00'),
(134, 19, 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', 'dell-precision-7560-xeon-11855m-32gb-512gb-rtx-a3000-6gb-156-fhd-ips-dell-precision-7560', 'Dell-Precision-7560', 'Xeon 11855M', '32GB', '512GB', 'RTX A3000 6GB', 'Đen', 20900000.00, 19000000.00, 17, 6, 1, '2026-04-05 16:39:41', '2026-04-09 19:41:00'),
(139, 21, 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', 'asus-tuf-gaming-f16-fx607vjb-rl151w-core-5-210h-16gb-512gb-rtx-3050-6gb-16-inch-fhd-144hz-asus-tuf-gaming-f16', 'Asus-TUF-Gaming-F16', 'Core 5 210H', '16GB', '512GB', NULL, 'Đen', 10000.00, 5000.00, 13, 7, 1, '2026-04-06 15:25:36', '2026-04-09 17:34:09');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_groups`
--

DROP TABLE IF EXISTS `product_groups`;
CREATE TABLE `product_groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED NOT NULL,
  `group_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `warranty_months` int(10) UNSIGNED NOT NULL DEFAULT 12,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `view_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_groups`
--

INSERT INTO `product_groups` (`id`, `category_id`, `brand_id`, `group_name`, `slug`, `short_description`, `description`, `warranty_months`, `is_active`, `is_featured`, `view_count`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'LOQ 2028', 'loq-2028', 'LOQ 2028', NULL, 24, 1, 0, 21, '2026-04-04 13:38:51', '2026-04-09 19:40:36'),
(16, 1, 1, 'LOQ 2024', 'loq-2024', 'LOQ 2024', '123', 24, 1, 0, 0, '2026-04-05 15:22:34', '2026-04-06 16:03:11'),
(17, 7, 7, 'Dell 2025', 'dell-2025', 'Dell 2025', NULL, 24, 1, 0, 0, '2026-04-05 15:34:00', '2026-04-05 16:00:37'),
(19, 7, 7, 'Dell Precision', 'dell-precision', 'Dell Precision 7560 | Xeon 11855M, 32GB, 512GB, RTX A3000 6GB, 15.6\'\' FHD IPS', NULL, 24, 1, 0, 26, '2026-04-05 16:39:41', '2026-04-09 19:03:41'),
(20, 8, 7, '123', '123', '123', '123', 24, 1, 0, 0, '2026-04-05 16:41:47', '2026-04-05 16:41:47'),
(21, 1, 8, 'Asus 2028', 'asus-2028', 'Asus TUF Gaming F16 FX607VJB-RL151W | Core 5 210H, 16GB, 512GB, RTX 3050 6GB, 16 inch FHD+ 144Hz', NULL, 24, 1, 0, 78, '2026-04-06 15:25:34', '2026-04-09 18:58:27'),
(22, 8, 8, '123', '123-2', '123', '123', 24, 1, 1, 0, '2026-04-06 15:36:36', '2026-04-06 16:33:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_images`
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product_images`
--

INSERT INTO `product_images` (`id`, `group_id`, `product_id`, `image_url`, `is_primary`, `sort_order`, `created_at`) VALUES
(2, 1, 1, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775487872/tn-laptop/products/product-1775487855190-252589271.jpg', 1, 0, '2026-04-06 15:04:17'),
(26, 1, 2, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775491492/tn-laptop/products/product-1775491475164-242503586.jpg', 1, 0, '2026-04-06 16:04:37'),
(97, 21, 139, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775489752/tn-laptop/products/product-1775489734748-51356781.jpg', 1, 0, '2026-04-08 14:57:14'),
(98, 21, 139, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775489768/tn-laptop/products/product-1775489750640-54713265.jpg', 0, 1, '2026-04-08 14:57:14'),
(99, 21, 139, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775491532/tn-laptop/products/product-1775491515418-952877891.jpg', 0, 2, '2026-04-08 14:57:14'),
(100, 21, 139, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775491532/tn-laptop/products/product-1775491515418-214775322.jpg', 0, 3, '2026-04-08 14:57:14'),
(101, 21, 139, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775491533/tn-laptop/products/product-1775491515426-448401057.jpg', 0, 4, '2026-04-08 14:57:14'),
(102, 21, 139, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775491532/tn-laptop/products/product-1775491515432-771299870.jpg', 0, 5, '2026-04-08 14:57:14'),
(106, 19, 134, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775490814/tn-laptop/products/product-1775490796946-842767715.jpg', 1, 0, '2026-04-09 16:46:10'),
(107, 19, 134, 'https://res.cloudinary.com/dc4ebrhks/image/upload/v1775661576/tn-laptop/products/product-1775661557679-507891334.jpg', 0, 1, '2026-04-09 16:46:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product_specs`
--

DROP TABLE IF EXISTS `product_specs`;
CREATE TABLE `product_specs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `spec_name` varchar(120) NOT NULL,
  `spec_value` varchar(500) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_receipts`
--

DROP TABLE IF EXISTS `purchase_receipts`;
CREATE TABLE `purchase_receipts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `purchase_receipt_items`
--

DROP TABLE IF EXISTS `purchase_receipt_items`;
CREATE TABLE `purchase_receipt_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `receipt_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_cost` decimal(15,2) NOT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reviews`
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_item_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `review_title` varchar(255) DEFAULT NULL,
  `review_content` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT 1,
  `is_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `review_replies`
--

DROP TABLE IF EXISTS `review_replies`;
CREATE TABLE `review_replies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `review_id` bigint(20) UNSIGNED NOT NULL,
  `admin_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `role_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'ADMIN', 'Quan tri he thong', '2026-04-04 13:25:34', '2026-04-04 13:25:34'),
(2, 'CUSTOMER', 'Khach hang mua sam', '2026-04-04 13:25:34', '2026-04-04 13:25:34');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping_carriers`
--

DROP TABLE IF EXISTS `shipping_carriers`;
CREATE TABLE `shipping_carriers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `carrier_name` varchar(120) NOT NULL,
  `carrier_code` varchar(50) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `shipping_carriers`
--

INSERT INTO `shipping_carriers` (`id`, `carrier_name`, `carrier_code`, `note`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Nội bộ', 'INTERNAL', 'Đang sử dụng', 1, '2026-04-09 19:16:58', '2026-04-09 19:16:58'),
(2, 'GHN', 'GHN', 'Sẽ phát triển sau', 0, '2026-04-09 19:16:58', '2026-04-09 19:16:58'),
(3, 'ViettelPost', 'VIETTEL_POST', 'Sẽ phát triển sau', 0, '2026-04-09 19:16:58', '2026-04-09 19:16:58');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shipping_methods`
--

DROP TABLE IF EXISTS `shipping_methods`;
CREATE TABLE `shipping_methods` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `method_name` varchar(120) NOT NULL,
  `method_code` varchar(50) NOT NULL,
  `fee` decimal(15,2) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `carrier_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `shipping_methods`
--

INSERT INTO `shipping_methods` (`id`, `method_name`, `method_code`, `fee`, `description`, `carrier_id`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Hỏa tốc', 'EXPRESS', 50000.00, 'Trong ngày', NULL, 1, 1, '2026-04-04 13:25:35', '2026-04-09 19:05:45'),
(2, 'Nhanh', 'FAST', 30000.00, '2 - 4 ngày', NULL, 2, 1, '2026-04-04 13:25:35', '2026-04-09 19:05:45'),
(3, 'Tiết kiệm', 'SAVING', 20000.00, '4 - 7 ngày', NULL, 3, 1, '2026-04-04 13:25:35', '2026-04-09 19:05:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `source_type` enum('IMPORT','ORDER','RETURN','ADJUST') NOT NULL,
  `source_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity_change` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `source_type`, `source_id`, `quantity_change`, `note`, `created_by`, `created_at`) VALUES
(1, 134, 'ORDER', 1, -1, 'Tru kho tu don hang DH2604092466', NULL, '2026-04-08 18:01:04'),
(2, 1, 'ORDER', 1, -1, 'Tru kho tu don hang DH2604092466', NULL, '2026-04-08 18:01:04'),
(3, 2, 'ORDER', 1, -1, 'Tru kho tu don hang DH2604092466', NULL, '2026-04-08 18:01:04'),
(4, 139, 'ORDER', 1, -1, 'Tru kho tu don hang DH2604092466', NULL, '2026-04-08 18:01:04'),
(5, 139, 'ORDER', 2, -1, 'Tru kho tu don hang DH2604097175', NULL, '2026-04-08 18:13:49'),
(6, 134, 'ORDER', 2, -1, 'Tru kho tu don hang DH2604097175', NULL, '2026-04-08 18:13:49'),
(7, 139, 'ORDER', 3, -1, 'Tru kho tu don hang DH2604094916', NULL, '2026-04-08 18:15:29'),
(8, 139, 'ORDER', 4, -1, 'Tru kho tu don hang DH2604091486', NULL, '2026-04-09 16:14:00'),
(9, 134, 'ORDER', 4, -1, 'Tru kho tu don hang DH2604091486', NULL, '2026-04-09 16:14:00'),
(10, 2, 'ORDER', 4, -1, 'Tru kho tu don hang DH2604091486', NULL, '2026-04-09 16:14:00'),
(11, 134, 'ORDER', 5, -1, 'Tru kho tu don hang DH2604094757', NULL, '2026-04-09 16:46:14'),
(12, 139, 'ORDER', 6, -1, 'Tru kho tu don hang DH2604097532', NULL, '2026-04-09 16:54:19'),
(13, 139, 'ORDER', 7, -1, 'Tru kho tu don hang DH2604091094', NULL, '2026-04-09 16:54:45'),
(14, 134, 'ORDER', 8, -1, 'Tru kho tu don hang DH2604101480', NULL, '2026-04-09 17:34:09'),
(15, 139, 'ORDER', 8, -1, 'Tru kho tu don hang DH2604101480', NULL, '2026-04-09 17:34:09'),
(16, 134, 'ORDER', 9, -1, 'Tru kho tu don hang DH2604105066', NULL, '2026-04-09 19:41:00'),
(17, 1, 'ORDER', 9, -1, 'Tru kho tu don hang DH2604105066', NULL, '2026-04-09 19:41:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `supplier_name` varchar(200) NOT NULL,
  `contact_name` varchar(120) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `full_name` varchar(120) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `user_status` enum('ACTIVE','BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `google_id` varchar(191) DEFAULT NULL,
  `facebook_id` varchar(191) DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `role_id`, `email`, `password_hash`, `full_name`, `phone`, `gender`, `date_of_birth`, `avatar_url`, `email_verified`, `user_status`, `google_id`, `facebook_id`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'tathainguyen686@gmail.com', '$2b$10$H1.36wc.9anmUKG4Ac.PvuFsmP/YJfGIGNPGAoBEG852slNCMUO0e', 'thainguyenAdmin', '0913778899', 'MALE', NULL, NULL, 1, 'ACTIVE', NULL, NULL, NULL, '2026-04-04 13:28:21', '2026-04-07 16:58:39'),
(6, 2, 'tathainguyen24@gmail.com', '$2b$10$1O7T49UGsnwQhXJkG0m8Nudp25NG7DQCl3RLTNLAuPyU57kR1azUm', 'Nguyễn Thái', '0913772244', 'MALE', NULL, NULL, 1, 'ACTIVE', NULL, NULL, NULL, '2026-04-07 17:19:17', '2026-04-08 14:20:34');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_addresses`
--

DROP TABLE IF EXISTS `user_addresses`;
CREATE TABLE `user_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `recipient_name` varchar(120) NOT NULL,
  `recipient_phone` varchar(20) NOT NULL,
  `province` varchar(120) NOT NULL,
  `district` varchar(120) NOT NULL,
  `ward` varchar(120) NOT NULL,
  `address_line` varchar(255) NOT NULL,
  `address_note` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_addresses`
--

INSERT INTO `user_addresses` (`id`, `user_id`, `recipient_name`, `recipient_phone`, `province`, `district`, `ward`, `address_line`, `address_note`, `is_default`, `created_at`, `updated_at`) VALUES
(6, 6, 'nguyen', '0913778899', 'TP. Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123', NULL, 0, '2026-04-08 18:14:40', '2026-04-08 18:14:40'),
(7, 6, 'thai', '0913669955', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Yên Hòa', '123', NULL, 0, '2026-04-08 18:15:05', '2026-04-08 18:15:05');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_vouchers`
--

DROP TABLE IF EXISTS `user_vouchers`;
CREATE TABLE `user_vouchers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `voucher_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `voucher_status` enum('AVAILABLE','USED','EXPIRED') NOT NULL DEFAULT 'AVAILABLE',
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp(),
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE `vouchers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `voucher_name` varchar(150) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `discount_type` enum('PERCENT','FIXED') NOT NULL,
  `discount_value` decimal(15,2) NOT NULL,
  `max_discount_value` decimal(15,2) DEFAULT NULL,
  `min_order_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_usage_limit` int(10) UNSIGNED DEFAULT NULL,
  `used_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_banners_created_by` (`created_by`);

--
-- Chỉ mục cho bảng `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_blog_categories_slug` (`slug`),
  ADD UNIQUE KEY `uk_blog_categories_name` (`category_name`);

--
-- Chỉ mục cho bảng `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_blog_comments_post_id` (`post_id`),
  ADD KEY `idx_blog_comments_user_id` (`user_id`),
  ADD KEY `idx_blog_comments_parent_id` (`parent_id`);

--
-- Chỉ mục cho bảng `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_blog_posts_slug` (`slug`),
  ADD KEY `idx_blog_posts_category_id` (`category_id`),
  ADD KEY `idx_blog_posts_author_id` (`author_id`);

--
-- Chỉ mục cho bảng `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_brands_brand_name` (`brand_name`),
  ADD UNIQUE KEY `uk_brands_slug` (`slug`);

--
-- Chỉ mục cho bảng `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_carts_user_id` (`user_id`),
  ADD UNIQUE KEY `uk_carts_session_id` (`session_id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cart_items_cart_product` (`cart_id`,`product_id`),
  ADD KEY `idx_cart_items_product_id` (`product_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_categories_slug` (`slug`),
  ADD KEY `idx_categories_parent_id` (`parent_id`);

--
-- Chỉ mục cho bảng `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_messages_room_id` (`room_id`),
  ADD KEY `idx_chat_messages_sender_id` (`sender_id`);

--
-- Chỉ mục cho bảng `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_rooms_customer_id` (`customer_id`),
  ADD KEY `idx_chat_rooms_admin_id` (`admin_id`);

--
-- Chỉ mục cho bảng `ghn_shipments`
--
ALTER TABLE `ghn_shipments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ghn_shipments_order_id` (`order_id`),
  ADD UNIQUE KEY `uk_ghn_shipments_shipping_order_code` (`shipping_order_code`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_orders_order_code` (`order_code`),
  ADD KEY `idx_orders_user_id` (`user_id`),
  ADD KEY `idx_orders_user_address_id` (`user_address_id`),
  ADD KEY `idx_orders_shipping_method_id` (`shipping_method_id`),
  ADD KEY `idx_orders_voucher_id` (`voucher_id`),
  ADD KEY `idx_orders_cancelled_by` (`cancelled_by`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_id` (`order_id`),
  ADD KEY `idx_order_items_product_id` (`product_id`);

--
-- Chỉ mục cho bảng `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_status_histories_order_id` (`order_id`),
  ADD KEY `idx_order_status_histories_changed_by` (`changed_by`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_payments_order_id` (`order_id`),
  ADD KEY `idx_payments_transaction_ref` (`transaction_ref`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_products_slug` (`slug`),
  ADD UNIQUE KEY `uk_products_sku` (`sku`),
  ADD KEY `idx_products_group_id` (`group_id`);

--
-- Chỉ mục cho bảng `product_groups`
--
ALTER TABLE `product_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_product_groups_slug` (`slug`),
  ADD KEY `idx_product_groups_category_id` (`category_id`),
  ADD KEY `idx_product_groups_brand_id` (`brand_id`);

--
-- Chỉ mục cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_images_group_id` (`group_id`),
  ADD KEY `idx_product_images_product_id` (`product_id`);

--
-- Chỉ mục cho bảng `product_specs`
--
ALTER TABLE `product_specs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_specs_product_id` (`product_id`);

--
-- Chỉ mục cho bảng `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_purchase_receipts_supplier_id` (`supplier_id`),
  ADD KEY `idx_purchase_receipts_created_by` (`created_by`);

--
-- Chỉ mục cho bảng `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_receipt_product` (`receipt_id`,`product_id`),
  ADD KEY `idx_purchase_receipt_items_product_id` (`product_id`);

--
-- Chỉ mục cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_reviews_order_item_id` (`order_item_id`),
  ADD KEY `idx_reviews_product_id` (`product_id`),
  ADD KEY `idx_reviews_user_id` (`user_id`);

--
-- Chỉ mục cho bảng `review_replies`
--
ALTER TABLE `review_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_review_replies_review_id` (`review_id`),
  ADD KEY `idx_review_replies_admin_id` (`admin_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_roles_role_name` (`role_name`);

--
-- Chỉ mục cho bảng `shipping_carriers`
--
ALTER TABLE `shipping_carriers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_shipping_carriers_code` (`carrier_code`);

--
-- Chỉ mục cho bảng `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_shipping_methods_code` (`method_code`),
  ADD KEY `idx_shipping_methods_carrier_id` (`carrier_id`);

--
-- Chỉ mục cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stock_movements_product_id` (`product_id`),
  ADD KEY `idx_stock_movements_created_by` (`created_by`);

--
-- Chỉ mục cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_suppliers_supplier_name` (`supplier_name`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_users_email` (`email`),
  ADD UNIQUE KEY `uk_users_google_id` (`google_id`),
  ADD UNIQUE KEY `uk_users_facebook_id` (`facebook_id`),
  ADD KEY `idx_users_role_id` (`role_id`);

--
-- Chỉ mục cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_addresses_user_id` (`user_id`);

--
-- Chỉ mục cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_vouchers_user_voucher` (`user_id`,`voucher_id`),
  ADD KEY `idx_user_vouchers_voucher_id` (`voucher_id`),
  ADD KEY `idx_user_vouchers_order_id` (`order_id`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_vouchers_code` (`code`),
  ADD KEY `idx_vouchers_created_by` (`created_by`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `banners`
--
ALTER TABLE `banners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `blog_comments`
--
ALTER TABLE `blog_comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `carts`
--
ALTER TABLE `carts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `ghn_shipments`
--
ALTER TABLE `ghn_shipments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `order_status_histories`
--
ALTER TABLE `order_status_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT cho bảng `product_groups`
--
ALTER TABLE `product_groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT cho bảng `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;

--
-- AUTO_INCREMENT cho bảng `product_specs`
--
ALTER TABLE `product_specs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `review_replies`
--
ALTER TABLE `review_replies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `shipping_carriers`
--
ALTER TABLE `shipping_carriers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `shipping_methods`
--
ALTER TABLE `shipping_methods`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `banners`
--
ALTER TABLE `banners`
  ADD CONSTRAINT `fk_banners_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `blog_comments`
--
ALTER TABLE `blog_comments`
  ADD CONSTRAINT `fk_blog_comments_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_blog_comments_post_id` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_blog_comments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `fk_blog_posts_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_blog_posts_category_id` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `fk_carts_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_items_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cart_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `fk_categories_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_chat_messages_room_id` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_messages_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD CONSTRAINT `fk_chat_rooms_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_rooms_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `ghn_shipments`
--
ALTER TABLE `ghn_shipments`
  ADD CONSTRAINT `fk_ghn_shipments_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_shipping_method_id` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user_address_id` FOREIGN KEY (`user_address_id`) REFERENCES `user_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_voucher_id` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_status_histories`
--
ALTER TABLE `order_status_histories`
  ADD CONSTRAINT `fk_order_status_histories_changed_by` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_status_histories_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_group_id` FOREIGN KEY (`group_id`) REFERENCES `product_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_groups`
--
ALTER TABLE `product_groups`
  ADD CONSTRAINT `fk_product_groups_brand_id` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_groups_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_group_id` FOREIGN KEY (`group_id`) REFERENCES `product_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_images_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `product_specs`
--
ALTER TABLE `product_specs`
  ADD CONSTRAINT `fk_product_specs_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `purchase_receipts`
--
ALTER TABLE `purchase_receipts`
  ADD CONSTRAINT `fk_purchase_receipts_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_purchase_receipts_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `purchase_receipt_items`
--
ALTER TABLE `purchase_receipt_items`
  ADD CONSTRAINT `fk_purchase_receipt_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_purchase_receipt_items_receipt_id` FOREIGN KEY (`receipt_id`) REFERENCES `purchase_receipts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_order_item_id` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `review_replies`
--
ALTER TABLE `review_replies`
  ADD CONSTRAINT `fk_review_replies_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_review_replies_review_id` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD CONSTRAINT `fk_shipping_methods_carrier_id` FOREIGN KEY (`carrier_id`) REFERENCES `shipping_carriers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_stock_movements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_movements_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `fk_user_addresses_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD CONSTRAINT `fk_user_vouchers_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_vouchers_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_vouchers_voucher_id` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD CONSTRAINT `fk_vouchers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
