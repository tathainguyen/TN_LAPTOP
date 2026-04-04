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
