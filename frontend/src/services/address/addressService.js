import axios from 'axios';

const addressApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAddresses(userId) {
  const response = await addressApi.get(`/customer/${userId}/addresses`);
  return response.data;
}

export async function createAddress(userId, payload) {
  const response = await addressApi.post(`/customer/${userId}/addresses`, payload);
  return response.data;
}

export async function updateAddress(userId, addressId, payload) {
  const response = await addressApi.put(`/customer/${userId}/addresses/${addressId}`, payload);
  return response.data;
}

export async function deleteAddress(userId, addressId) {
  const response = await addressApi.delete(`/customer/${userId}/addresses/${addressId}`);
  return response.data;
}
