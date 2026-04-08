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

export async function placeCodOrder(payload) {
  const response = await orderApi.post('/cod', payload);
  return response.data;
}
