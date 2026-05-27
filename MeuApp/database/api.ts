import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use seu IP local (rode "ipconfig" no terminal para descobrir)
const API_URL = 'http://192.168.1.10:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data) {
    console.log('=== ENVIANDO PARA API ===', config.data);
  }
  return config;
});

export default api;