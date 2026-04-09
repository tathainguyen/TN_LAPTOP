import axios from 'axios';

const shippingApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/shipping',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getShippingMethodsAdmin() {
  const response = await shippingApi.get('/methods');
  return response.data;
}

export async function createShippingMethodAdmin(payload) {
  const response = await shippingApi.post('/methods', payload);
  return response.data;
}

export async function updateShippingMethodAdmin(id, payload) {
  const response = await shippingApi.put(`/methods/${Number(id)}`, payload);
  return response.data;
}

export async function deleteShippingMethodAdmin(id) {
  const response = await shippingApi.delete(`/methods/${Number(id)}`);
  return response.data;
}

export async function getShippingCarriersAdmin() {
  const response = await shippingApi.get('/carriers');
  return response.data;
}

export async function createShippingCarrierAdmin(payload) {
  const response = await shippingApi.post('/carriers', payload);
  return response.data;
}

export async function updateShippingCarrierAdmin(id, payload) {
  const response = await shippingApi.put(`/carriers/${Number(id)}`, payload);
  return response.data;
}

export async function deleteShippingCarrierAdmin(id) {
  const response = await shippingApi.delete(`/carriers/${Number(id)}`);
  return response.data;
}
