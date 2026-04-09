import axios from 'axios';

const orderApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/orders',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getCheckoutData(userId) {
  const response = await orderApi.get('/checkout-data', {
    params: { user_id: Number(userId) },
  });

  return response.data;
}

export async function getCustomerOrders(userId) {
  const response = await orderApi.get('/customer', {
    params: { user_id: Number(userId) },
  });

  return response.data;
}

export async function getCustomerOrderDetail(userId, orderId) {
  const response = await orderApi.get(`/customer/${Number(orderId)}`, {
    params: { user_id: Number(userId) },
  });

  return response.data;
}

export async function cancelCustomerOrder(userId, orderId, payload = {}) {
  const response = await orderApi.patch(
    `/customer/${Number(orderId)}/cancel`,
    {
      ...payload,
      user_id: Number(userId),
    }
  );

  return response.data;
}

export async function getAdminOrders(params = {}) {
  const response = await orderApi.get('/admin', { params });
  return response.data;
}

export async function getAdminOrderDetail(orderId) {
  const response = await orderApi.get(`/admin/${Number(orderId)}`);
  return response.data;
}

export async function updateAdminOrderStatus(id, payload) {
  const response = await orderApi.patch(`/admin/${id}/status`, payload);
  return response.data;
}

export async function placeCodOrder(payload) {
  const response = await orderApi.post('/cod', payload);
  return response.data;
}
