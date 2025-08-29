import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const redirectedRef = useRef(false); // ✅ prevent double redirects

  // ----------------- VALIDATE USER -----------------
  const validateUser = async (t) => {
    try {
      const { data } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });

      const uo = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role || "user", // ✅ always provide role
      };

      setUser(uo);
      localStorage.setItem("user", JSON.stringify(uo));
      return uo;
    } catch (err) {
      console.error("❌ Auth validate failed:", err.response?.data || err.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      return null;
    }
  };

  // ----------------- REFRESH ON PAGE RELOAD -----------------
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;

    setToken(t);

    const refreshUser = async () => {
      const uo = await validateUser(t);

      if (!redirectedRef.current && uo) {
        redirectedRef.current = true;
        if (uo.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    };

    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------- LOGIN HANDLER -----------------
  const login = async (jwtToken) => {
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);

    const uo = await validateUser(jwtToken);

    if (uo) {
      // ✅ redirect always based on role
      if (uo.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  };

  // ----------------- LOGOUT -----------------
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // ----------------- CONTEXT VALUE -----------------
  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
export default AuthContext;
