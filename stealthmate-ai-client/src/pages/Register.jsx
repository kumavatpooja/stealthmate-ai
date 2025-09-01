import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../hooks/useToast";
import useAuth from "../hooks/useAuth";
import api from "../utils/axios";

import LoginCard from "../assets/logincard.png";
import userIcon from "../assets/user.png";
import GoogleIcon from "../assets/googleicon.png";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { success, error } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  // ---------------- REGISTER ----------------
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { name, email });
      success("🎉 Registered successfully! Please log in");
      navigate("/login");
    } catch (err) {
      error(err.response?.data?.message || "Registration failed");
    }
  };

  // ---------------- GOOGLE POPUP LOGIN ----------------
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
              success("✅ Logged in with Google");
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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f5f0fa" }}>
      <motion.div
        whileHover={{ scale: 1.03 }} // Hover movement
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-[1200px] max-w-full h-[600px] bg-white rounded-2xl shadow-xl flex overflow-hidden transition-transform duration-500"
      >
        {/* Left side image */}
        <div className="w-1/2 h-full hidden md:flex flex-col justify-center items-center relative">
          <img
            src={LoginCard}
            alt="Visual"
            className="w-full h-full object-cover rounded-l-2xl brightness-105 contrast-100"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6">
            <h2 className="text-white text-4xl font-bold drop-shadow-lg">
              Welcome to StealthMate
            </h2>
            <p className="text-white mt-3 text-lg drop-shadow-md">
              Your personal interview assistant
            </p>
          </div>
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="text-center mb-6">
              <img src={userIcon} alt="User" className="w-12 h-12 mx-auto" />
              <h2 className="text-2xl font-bold mt-2">
                Register for <span className="text-pink-500">StealthMate</span>
              </h2>
              <p className="text-sm mt-1 text-gray-500">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-pink-500 hover:underline"
                >
                  Login
                </button>
              </p>
            </div>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 rounded-full border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-full border border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />

            <button
              type="submit"
              className="w-full py-3 bg-pink-500 text-white rounded-full font-semibold hover:bg-pink-600 transition"
            >
              Create Account
            </button>

            <div className="text-center text-sm text-gray-500">or continue with</div>

            <div
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 cursor-pointer transition hover:text-pink-500"
            >
              <img src={GoogleIcon} alt="Google" className="w-8 h-8" />
              <span className="text-lg font-semibold">Continue with Google</span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
