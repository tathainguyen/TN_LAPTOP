const GUEST_CART_KEY = 'tn_laptop_guest_cart';

function normalizeQuantity(value) {
  const quantity = Number(value || 0);
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(0, Math.floor(quantity));
}

export function getGuestCartItems() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        product_id: Number(item?.product_id),
        quantity: normalizeQuantity(item?.quantity),
        product_name: String(item?.product_name || ''),
        slug: String(item?.slug || ''),
        primary_image: String(item?.primary_image || ''),
        unit_price: Number(item?.unit_price || 0),
      }))
      .filter((item) => Number.isInteger(item.product_id) && item.product_id > 0 && item.quantity > 0);
  } catch {
    return [];
  }
}

export function saveGuestCartItems(items) {
  const normalized = Array.isArray(items)
    ? items
        .map((item) => ({
          product_id: Number(item?.product_id),
          quantity: normalizeQuantity(item?.quantity),
          product_name: String(item?.product_name || ''),
          slug: String(item?.slug || ''),
          primary_image: String(item?.primary_image || ''),
          unit_price: Number(item?.unit_price || 0),
        }))
        .filter((item) => Number.isInteger(item.product_id) && item.product_id > 0 && item.quantity > 0)
    : [];

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('tn-laptop-cart-change'));
}

export function clearGuestCartItems() {
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event('tn-laptop-cart-change'));
}

export function getGuestCartCount() {
  return getGuestCartItems().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

export function addGuestCartItem(nextItem) {
  const productId = Number(nextItem?.product_id || 0);
  const quantity = normalizeQuantity(nextItem?.quantity || 1);

  if (!Number.isInteger(productId) || productId <= 0 || quantity <= 0) {
    return;
  }

  const currentItems = getGuestCartItems();
  const existing = currentItems.find((item) => item.product_id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    currentItems.push({
      product_id: productId,
      quantity,
      product_name: String(nextItem?.product_name || ''),
      slug: String(nextItem?.slug || ''),
      primary_image: String(nextItem?.primary_image || ''),
      unit_price: Number(nextItem?.unit_price || 0),
    });
  }

  saveGuestCartItems(currentItems);
}
