import axios from 'axios';

const voucherApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/vouchers',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getVoucherTypesAdmin() {
  const response = await voucherApi.get('/types');
  return response.data;
}

export async function createVoucherTypeAdmin(payload) {
  const response = await voucherApi.post('/types', payload);
  return response.data;
}

export async function updateVoucherTypeAdmin(id, payload) {
  const response = await voucherApi.put(`/types/${Number(id)}`, payload);
  return response.data;
}

export async function deleteVoucherTypeAdmin(id) {
  const response = await voucherApi.delete(`/types/${Number(id)}`);
  return response.data;
}

export async function getVoucherCodesAdmin() {
  const response = await voucherApi.get('/codes');
  return response.data;
}

export async function createVoucherCodeAdmin(payload) {
  const response = await voucherApi.post('/codes', payload);
  return response.data;
}

export async function updateVoucherCodeAdmin(id, payload) {
  const response = await voucherApi.put(`/codes/${Number(id)}`, payload);
  return response.data;
}

export async function deleteVoucherCodeAdmin(id) {
  const response = await voucherApi.delete(`/codes/${Number(id)}`);
  return response.data;
}

export async function getCheckoutVouchers(orderAmount) {
  const response = await voucherApi.get('/checkout/available', {
    params: {
      order_amount: Number(orderAmount || 0),
    },
  });

  return response.data;
}

export async function validateCheckoutVoucher(code, orderAmount) {
  const response = await voucherApi.post('/checkout/validate', {
    code: String(code || '').trim().toUpperCase(),
    order_amount: Number(orderAmount || 0),
  });

  return response.data;
}
