import axios from 'axios';

const catalogApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/catalog',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getBrands(params = {}) {
  const response = await catalogApi.get('/brands', { params });
  return response.data;
}

export async function createBrand(payload) {
  const response = await catalogApi.post('/brands', payload);
  return response.data;
}

export async function updateBrand(id, payload) {
  const response = await catalogApi.put(`/brands/${id}`, payload);
  return response.data;
}

export async function toggleBrandStatus(id, isActive) {
  const response = await catalogApi.patch(`/brands/${id}/status`, {
    is_active: isActive,
  });
  return response.data;
}

export async function deleteBrand(id) {
  const response = await catalogApi.delete(`/brands/${id}`);
  return response.data;
}

export async function getCategories(params = {}) {
  const response = await catalogApi.get('/categories', { params });
  return response.data;
}

export async function createCategory(payload) {
  const response = await catalogApi.post('/categories', payload);
  return response.data;
}

export async function updateCategory(id, payload) {
  const response = await catalogApi.put(`/categories/${id}`, payload);
  return response.data;
}

export async function toggleCategoryStatus(id, isActive) {
  const response = await catalogApi.patch(`/categories/${id}/status`, {
    is_active: isActive,
  });
  return response.data;
}

export async function deleteCategory(id) {
  const response = await catalogApi.delete(`/categories/${id}`);
  return response.data;
}
