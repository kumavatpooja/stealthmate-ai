import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";

import LoginCard from "../assets/logincard.png";
import userIcon from "../assets/user.png";
import GoogleIcon from "../assets/Googleicon.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const handleSendOtp = async () => {
    try {
      await axios.post("http://localhost:10000/api/auth/login/email", {
        email: email.trim(),
      });
      success("📩 OTP sent to your email");
      setTimeout(() => {
        setShowOtpField(true);
      }, 600);
    } catch (err) {
      error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:10000/api/auth/login/verify", {
        email,
        otp,
      });

      if (res.data?.token) {
        success("✅ Logged in successfully");
        await login(res.data.token); // <--- await to ensure context updates
        setOtp("");
        navigate("/dashboard");
      } else {
        error("❌ Invalid OTP");
      }
    } catch (err) {
      error(err.response?.data?.message || "❌ Invalid OTP");
      setOtp("");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:10000/api/auth/google";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#f5f0fa" }} // very faint lavender
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[1000px] h-[600px] max-w-full bg-white rounded-2xl shadow-xl flex overflow-hidden"
      >
        {/* Left side image */}
        <div className="w-1/2 h-full hidden md:flex flex-col justify-center items-center bg-[#9b2c77] p-8 text-white">
          <img
            src={LoginCard}
            alt="Visual"
            className="w-full h-full object-cover rounded-l-2xl brightness-110 contrast-125"
          />
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
          <div className="text-center mb-6">
            <img src={userIcon} alt="User" className="w-12 h-12 mx-auto" />
            <h2 className="text-2xl font-bold mt-2">
              Login to <span className="text-pink-500">StealthMate</span>
            </h2>
            <p className="text-sm mt-1 text-gray-500">
              Don’t have an account?{" "}
              <a href="/register" className="text-pink-500 hover:underline">
                Register
              </a>
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
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
