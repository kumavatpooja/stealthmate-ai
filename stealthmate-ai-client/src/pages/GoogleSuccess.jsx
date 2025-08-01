import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

const GoogleSuccess = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      success("Logged in via Google!");
      navigate("/dashboard");
    } else {
      error("Google login failed");
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>🔄 Logging in via Google...</div>;
};

export default GoogleSuccess;
