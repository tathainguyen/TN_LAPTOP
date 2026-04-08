import axios from 'axios';

const userApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/users',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getUserMasterData() {
  const response = await userApi.get('/admin/master-data');
  return response.data;
}

export async function getUsers(params = {}) {
  const response = await userApi.get('/admin', { params });
  return response.data;
}

export async function createAdminUser(payload) {
  const response = await userApi.post('/admin', payload);
  return response.data;
}

export async function getUserById(id) {
  const response = await userApi.get(`/admin/${id}`);
  return response.data;
}

export async function getUserActivityById(id) {
  const response = await userApi.get(`/admin/${id}/activity`);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await userApi.put(`/admin/${id}`, payload);
  return response.data;
}

export async function updateUserStatus(id, userStatus) {
  const response = await userApi.patch(`/admin/${id}/status`, {
    user_status: userStatus,
  });
  return response.data;
}

export async function deleteUser(id) {
  const response = await userApi.delete(`/admin/${id}`);
  return response.data;
}

// Customer profile and password functions
export async function updateUserProfile(userId, payload) {
  const response = await userApi.put(`/customer/${userId}/profile`, payload);
  return response.data;
}

export async function changeUserPassword(userId, payload) {
  const response = await userApi.post(`/customer/${userId}/password`, payload);
  return response.data;
}
