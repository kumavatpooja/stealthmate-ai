import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import api from "../utils/axios";

import LoginCard from "../assets/logincard.png";
import userIcon from "../assets/user.png";
import GoogleIcon from "../assets/googleicon.png";

const OTP_LENGTH = 6;

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [showOtpField, setShowOtpField] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false); // Prevent multiple requests
  const { login } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const inputRefs = useRef([]);

  // ---------------- SEND OTP ----------------
  const handleSendOtp = async () => {
    if (sendingOtp) return;
    setSendingOtp(true);
    try {
      await api.post("/auth/login/email", { email: email.trim() });
      success("📩 OTP sent to your email");
      setShowOtpField(true);
      setTimer(30);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err) {
      error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    try {
      const res = await api.post("/auth/login/verify", { email, otp: otpValue });
      if (res.data?.token) {
        const loggedInUser = await login(res.data.token);
        success(" Logged in successfully");
        setOtp(Array(OTP_LENGTH).fill(""));
        navigate(loggedInUser?.role === "admin" ? "/admin-dashboard" : "/dashboard");
      } else {
        error("❌ Invalid OTP");
      }
    } catch (err) {
      error(err.response?.data?.message || "❌ Invalid OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
    }
  };

  // ---------------- OTP TIMER ----------------
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ---------------- GOOGLE LOGIN ----------------
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
            const { data } = await api.post("/auth/login/google-token", { token: code });
            if (data?.token) {
              await login(data.token);
              success(" Logged in with Google");
              navigate(data.user?.role === "admin" ? "/admin-dashboard" : "/dashboard");
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

  // ---------------- OTP INPUT CHANGE ----------------
  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0fa" }}>
      <motion.div
        whileHover={{ scale: 1.03 }} // Hover movement
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[1200px] max-w-full h-[600px] bg-white rounded-2xl shadow-xl flex overflow-hidden transition-transform duration-500"
      >
        {/* Left Image with welcome text */}
        <div className="w-1/2 h-full hidden md:flex flex-col justify-center items-center relative">
          <img
            src={LoginCard}
            alt="Visual"
            className="w-full h-full object-cover rounded-l-2xl brightness-105 contrast-100"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
            <h2 className="text-white text-4xl font-bold drop-shadow-lg">
              Welcome Back!
            </h2>
            <p className="text-white mt-3 text-lg drop-shadow-md">
              Log in to access your StealthMate account
            </p>
          </div>
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
              <button type="button" onClick={() => navigate("/register")} className="text-pink-500 hover:underline">
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
                <div className="flex justify-between space-x-2">
                  {otp.map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength="1"
                      value={val}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      onChange={(e) => handleOtpChange(e, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-12 h-12 text-center text-lg font-bold rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                      style={{ backgroundColor: "#F3E8FF" }}
                    />
                  ))}
                </div>
                <div className="text-right text-sm mt-1">
                  {timer > 0 ? (
                    <span className="text-gray-400">Resend OTP in {timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className={`text-purple-500 hover:text-purple-700 underline text-sm font-medium bg-transparent p-0 border-0 cursor-pointer ${sendingOtp ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {sendingOtp ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              onClick={showOtpField ? handleVerifyOtp : handleSendOtp}
              disabled={sendingOtp}
              className={`w-full py-3 rounded-full font-semibold text-white transition
                bg-pink-500 hover:bg-pink-600 ${sendingOtp ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {sendingOtp ? "Sending..." : showOtpField ? "Verify OTP" : "Send OTP"}
            </button>

            <div className="text-center text-sm text-gray-500">or continue with</div>

            {/* Google login */}
            <div
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 cursor-pointer transition hover:text-pink-500"
            >
              <img src={GoogleIcon} alt="Google" className="w-8 h-8" />
              <span className="text-lg font-semibold">Continue with Google</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
