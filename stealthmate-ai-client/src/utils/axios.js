// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:10000/api', // or your backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // if you're using cookies
});

export default instance;
