// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // ❌ Removed withCredentials for JWT token-based login
});

export default instance;
