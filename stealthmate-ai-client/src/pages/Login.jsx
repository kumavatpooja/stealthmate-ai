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
  const [timer, setTimer] = useState(0); // countdown timer
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  // ---------------- OTP LOGIN ----------------
  const handleSendOtp = async () => {
    try {
      await api.post("/auth/login/email", { email: email.trim() });
      success("📩 OTP sent to your email");
      setShowOtpField(true);
      setTimer(20); // start 20 sec countdown
    } catch (err) {
      error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await api.post("/auth/login/verify", { email, otp });
      if (res.data?.token) {
        const loggedInUser = await login(res.data.token);
        success("✅ Logged in successfully");
        setOtp("");
        navigate(
          loggedInUser?.role === "admin" ? "/admin-dashboard" : "/dashboard"
        );
      } else {
        error("❌ Invalid OTP");
      }
    } catch (err) {
      error(err.response?.data?.message || "❌ Invalid OTP");
      setOtp("");
    }
  };

  // ---------------- OTP TIMER ----------------
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ---------------- GOOGLE POPUP LOGIN (CLASSIC) ----------------
  const handleGoogleLogin = async () => {
    try {
      const google = window.google;
      if (!google) {
        error("Google SDK not loaded");
        return;
      }

      const client = google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        ux_mode: "popup",
        prompt: "select_account",
        callback: async (response) => {
          const code = response.code;
          try {
            const { data } = await api.post(
              "/auth/login/google-token",
              { token: code },
              { withCredentials: true }
            );

            if (data?.token) {
              await login(data.token);
              success("✅ Logged in with Google");
              navigate(
                data.user?.role === "admin"
                  ? "/admin-dashboard"
                  : "/dashboard"
              );
            } else {
              error(data?.message || "❌ Google login failed");
            }
          } catch (err) {
            error(err.response?.data?.message || "❌ Google login failed");
          }
        },
      });

      client.requestCode();
    } catch (err) {
      console.error("Google popup error:", err);
      error("❌ Google login failed to start");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#f5f0fa" }}
    >
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
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 rounded-full border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={timer > 0}
                  className={`w-full py-2 rounded-full font-semibold transition ${
                    timer > 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-pink-500 text-white hover:bg-pink-600"
                  }`}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>
              </>
            )}

            <button
              onClick={showOtpField ? handleVerifyOtp : handleSendOtp}
              className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition"
            >
              {showOtpField ? "Verify OTP" : "Send OTP"}
            </button>

            <div className="text-center text-sm text-gray-500">
              or continue with
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-full border border-gray-300 flex items-center justify-center gap-3 text-gray-700 hover:bg-gray-100"
            >
              <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

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
