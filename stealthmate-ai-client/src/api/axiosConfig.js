// src/api/axiosConfig.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:10000/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// attach JWT from localStorage if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
