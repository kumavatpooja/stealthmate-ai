// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

// Minimal JWT payload parser (no external dependency required for decoding base64)
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(payload)));
  } catch (e) {
    console.warn("Failed to parse JWT:", e);
    return null;
  }
}

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    } else if (storedToken) {
      const decoded = parseJwt(storedToken);
      if (decoded) {
        const userObj = {
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          userId: decoded.userId || decoded.userID || decoded.sub,
        };
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
      }
    }
  }, []);

  const login = (jwtToken) => {
    return new Promise((resolve) => {
      const decoded = parseJwt(jwtToken);
      const userObj = decoded
        ? {
            name: decoded.name,
            email: decoded.email,
            role: decoded.role,
            userId: decoded.userId || decoded.userID || decoded.sub,
          }
        : null;

      setToken(jwtToken);
      localStorage.setItem("token", jwtToken);

      if (userObj) {
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      setTimeout(() => {
        resolve(userObj);
      }, 0);
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
