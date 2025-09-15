// src/hooks/useAuthSync.js
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const useAuthSync = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // ✅ Use same backend URL everywhere
        const BASE_URL = import.meta.env.VITE_BACKEND_URL;

        // Call /api/auth/me
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("✅ Auth Sync Response:", res.data);

      } catch (error) {
        console.error(
          "🔁 Auto logout triggered:",
          error?.response?.data || error.message
        );
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);
};

export default useAuthSync;
