import axios from 'axios';

import { clearGuestCartItems, getGuestCartItems } from './cartStorage.js';

const cartApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/cart',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getUserCart(userId) {
  const response = await cartApi.get('/', {
    params: { user_id: Number(userId) },
  });

  return response.data;
}

export async function addItemToUserCart({ userId, productId, quantity = 1 }) {
  const response = await cartApi.post('/items', {
    user_id: Number(userId),
    product_id: Number(productId),
    quantity: Number(quantity || 1),
  });

  window.dispatchEvent(new Event('tn-laptop-cart-change'));
  return response.data;
}

export async function updateUserCartItem({ userId, productId, quantity }) {
  const response = await cartApi.put(`/items/${Number(productId)}`, {
    user_id: Number(userId),
    quantity: Number(quantity || 0),
  });

  window.dispatchEvent(new Event('tn-laptop-cart-change'));
  return response.data;
}

export async function removeUserCartItem({ userId, productId }) {
  const response = await cartApi.delete(`/items/${Number(productId)}`, {
    data: { user_id: Number(userId) },
  });

  window.dispatchEvent(new Event('tn-laptop-cart-change'));
  return response.data;
}

export async function syncGuestCartToUser(userId) {
  const guestItems = getGuestCartItems();

  if (!Array.isArray(guestItems) || guestItems.length === 0) {
    return null;
  }

  const response = await cartApi.post('/sync', {
    user_id: Number(userId),
    items: guestItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    })),
  });

  clearGuestCartItems();
  window.dispatchEvent(new Event('tn-laptop-cart-change'));
  return response.data;
}

export async function getCartCountForHeader(user) {
  if (!user?.id) {
    const guestItems = getGuestCartItems();
    return guestItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  try {
    const response = await getUserCart(user.id);
    return Number(response?.data?.summary?.total_quantity || 0);
  } catch {
    return 0;
  }
}
