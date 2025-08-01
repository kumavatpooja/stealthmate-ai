// src/hooks/useAuth.js
import { useAuthContext } from "../context/AuthContext";

export default function useAuth() {
  const { user, token, login, logout } = useAuthContext();
  return { user, token, login, logout };
}
