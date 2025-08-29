import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import jwtDecode from "jwt-decode";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userObj = {
          name: decoded.name,
          email: decoded.email,
          role: decoded.role || "user",
          userId: decoded.userId || decoded.userID || decoded.sub,
        };

        login(userObj, token); // Pass both user and token
        success("Logged in via Google!");

        if (userObj.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        error("Invalid token received");
        navigate("/login");
      }
    } else {
      error("Google login failed");
      navigate("/login");
    }
  }, []);

  return <div>🔄 Logging in via Google...</div>;
};

export default GoogleSuccess;
