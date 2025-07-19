import { useEffect, useState } from "react";
import axios from "axios";

export default function useAuth() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("stealthmate-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("stealthmate-token") || "");

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "admin";

  // Email/Password Login
  const login = async (email, password) => {
    const res = await axios.post("http://localhost:10000/api/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("stealthmate-token", token);
    localStorage.setItem("stealthmate-user", JSON.stringify(user));
    setUser(user);
    setToken(token);
    return user;
  };

  // Google Login
  const loginWithGoogle = async (credential) => {
    const res = await axios.post("http://localhost:10000/api/auth/login/google-token", { token: credential });
    const { token, user } = res.data;
    localStorage.setItem("stealthmate-token", token);
    localStorage.setItem("stealthmate-user", JSON.stringify(user));
    setUser(user);
    setToken(token);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("stealthmate-token");
    localStorage.removeItem("stealthmate-user");
    setUser(null);
    setToken("");
  };

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    login,
    loginWithGoogle,
    logout,
  };
}
