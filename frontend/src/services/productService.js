import axios from 'axios';

const productApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/products',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getAllProducts() {
  const response = await productApi.get('/');
  return response.data;
}
