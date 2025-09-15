// src/utils/axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
  headers: {
    "Content-Type": "application/json", // ✅ default for login/register
  },
});

// ✅ Add a helper for resume upload (multipart)
export const uploadResumeAPI = async (formData, token) => {
  return instance.post("/resume/upload", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data", // override only here
    },
  });
};

export default instance;
