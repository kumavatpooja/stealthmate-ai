// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import api from "../utils/axios";

import LoginCard from "../assets/logincard.png";
import userIcon from "../assets/user.png";
import GoogleIcon from "../assets/googleicon.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  // ---------------- OTP LOGIN ----------------
  const handleSendOtp = async () => {
    try {
      await api.post("/auth/login/email", { email: email.trim() });
      success("📩 OTP sent to your email");
      setTimeout(() => setShowOtpField(true), 600);
    } catch (err) {
      error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post("/auth/login/verify", { email, otp });
      if (res.data?.token) {
        const loggedInUser = await login(res.data.token);
        success("Logged in successfully");
        setOtp("");

        if (loggedInUser?.role === "admin") navigate("/admin-dashboard");
        else navigate("/dashboard");
      } else {
        error("❌ Invalid OTP");
      }
    } catch (err) {
      error(err.response?.data?.message || "❌ Invalid OTP");
      setOtp("");
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = () => {
    window.open(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, "_self");
  };

  // Catch token if backend redirects with it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      (async () => {
        try {
          const loggedInUser = await login(token);
          success("Logged in with Google");

          if (loggedInUser?.role === "admin") navigate("/admin-dashboard");
          else navigate("/dashboard");
        } catch (err) {
          error("Google login failed");
        }
      })();
    }
  }, [login, navigate, success, error]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0fa" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[1000px] h-[600px] max-w-full bg-white rounded-2xl shadow-xl flex overflow-hidden"
      >
        {/* Left Image */}
        <div className="w-1/2 h-full hidden md:flex flex-col justify-center items-center bg-[#9b2c77] p-8 text-white">
          <img
            src={LoginCard}
            alt="Visual"
            className="w-full h-full object-cover rounded-l-2xl brightness-110 contrast-125"
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
          <div className="text-center mb-6">
            <img src={userIcon} alt="User" className="w-12 h-12 mx-auto" />
            <h2 className="text-2xl font-bold mt-2">
              Login to <span className="text-pink-500">StealthMate</span>
            </h2>
            <p className="text-sm mt-1 text-gray-500">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-pink-500 hover:underline"
              >
                Register
              </button>
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-full border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            {showOtpField && (
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 rounded-full border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            )}

            <button
              onClick={showOtpField ? handleVerifyOtp : handleSendOtp}
              className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition"
            >
              {showOtpField ? "Verify OTP" : "Send OTP"}
            </button>

            <div className="text-center text-sm text-gray-500">or continue with</div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-full border border-gray-300 flex items-center justify-center gap-3 text-gray-700 hover:bg-gray-100"
            >
              <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            {/* Admin Button */}
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin-dashboard")}
                className="w-full py-3 mt-2 bg-yellow-500 text-white rounded-full font-semibold hover:bg-yellow-600 transition"
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
