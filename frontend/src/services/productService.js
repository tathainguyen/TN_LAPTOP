import axios from 'axios';

const productApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/products',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAllProducts(params = {}) {
  const response = await productApi.get('/', { params });
  return response.data;
}

export async function getProductBySlug(slug) {
  const response = await productApi.get(`/${slug}`);
  return response.data;
}

export async function getProductMasterData() {
  const response = await productApi.get('/admin/master-data');
  return response.data;
}

export async function getProductById(id) {
  const response = await productApi.get(`/admin/${id}`);
  return response.data;
}

export async function getProductGroups(params = {}) {
  const response = await productApi.get('/admin/groups', { params });
  return response.data;
}

export async function createProductGroup(payload) {
  const response = await productApi.post('/admin/groups', payload);
  return response.data;
}

export async function updateProductGroup(id, payload) {
  const response = await productApi.put(`/admin/groups/${id}`, payload);
  return response.data;
}

export async function updateProductGroupStatus(id, isActive) {
  const response = await productApi.patch(`/admin/groups/${id}/status`, {
    is_active: isActive,
  });
  return response.data;
}

export async function deleteProductGroup(id) {
  const response = await productApi.delete(`/admin/groups/${id}`);
  return response.data;
}

export async function createProduct(payload) {
  const response = await productApi.post('/admin', payload);
  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await productApi.put(`/admin/${id}`, payload);
  return response.data;
}

export async function updateProductStatus(id, isActive) {
  const response = await productApi.patch(`/admin/${id}/status`, {
    is_active: isActive,
  });
  return response.data;
}

export async function deleteProduct(id) {
  const response = await productApi.delete(`/admin/${id}`);
  return response.data;
}
