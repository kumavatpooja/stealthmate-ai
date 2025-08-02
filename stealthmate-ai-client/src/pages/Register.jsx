import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "../hooks/useToast";
import api from "../utils/axios"; // ✅ Use axios instance

import LoginCard from "../assets/logincard.png";
import userIcon from "../assets/user.png";
import GoogleIcon from "../assets/googleicon.jpg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // ✅ Prevent form reload
    try {
      await api.post("/auth/register", { name, email });
      success("🎉 Registered successfully! Please log in");
      navigate("/login"); // ✅ Smooth SPA navigation
    } catch (err) {
      error(err.response?.data?.message || "Registration failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`; // ✅ Dynamic URL
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
        {/* Left image */}
        <div className="w-1/2 h-full hidden md:flex flex-col justify-center items-center bg-[#9b2c77] p-8 text-white">
          <img
            src={LoginCard}
            alt="Visual"
            className="w-full h-full object-cover rounded-l-2xl brightness-110 contrast-125"
          />
        </div>

        {/* Right form */}
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

            <div className="text-center text-sm text-gray-500">
              or continue with
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-full border border-gray-300 flex items-center justify-center gap-3 text-gray-700 hover:bg-gray-100"
            >
              <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
