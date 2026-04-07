import axios from 'axios';

const authApi = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function registerUser(payload) {
  const response = await authApi.post('/register', payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await authApi.post('/login', payload);
  return response.data;
}
