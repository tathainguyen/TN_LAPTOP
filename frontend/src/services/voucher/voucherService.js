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

export async function getCheckoutVouchers(orderAmount, userId) {
  const response = await voucherApi.get('/checkout/available', {
    params: {
      order_amount: Number(orderAmount || 0),
      user_id: Number(userId || 0),
    },
  });

  return response.data;
}

export async function validateCheckoutVoucher(code, orderAmount, userId) {
  const response = await voucherApi.post('/checkout/validate', {
    code: String(code || '').trim().toUpperCase(),
    order_amount: Number(orderAmount || 0),
    user_id: Number(userId || 0),
  });

  return response.data;
}

export async function getStorefrontVouchers(userId = null) {
  const response = await voucherApi.get('/storefront', {
    params: {
      user_id: userId ? Number(userId) : undefined,
    },
  });

  return response.data;
}

export async function saveVoucherToWallet({ userId, voucherId = null, code = '' }) {
  const payload = {
    user_id: Number(userId),
  };

  if (voucherId !== null && voucherId !== undefined) {
    payload.voucher_id = Number(voucherId);
  }

  if (String(code || '').trim()) {
    payload.code = String(code || '').trim().toUpperCase();
  }

  const response = await voucherApi.post('/customer/save', payload);
  return response.data;
}

export async function getCustomerVoucherWallet(userId) {
  const response = await voucherApi.get('/customer/wallet', {
    params: {
      user_id: Number(userId),
    },
  });

  return response.data;
}
