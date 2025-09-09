import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import robo from "../assets/robo.png";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-gradient-to-r from-[#ec4899] via-fuchsia-600 to-[#9c48e1] shadow-lg">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 sm:px-16 py-4 text-white">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-3">
          <img src={robo} alt="logo" className="w-10 sm:w-12" />
          <motion.h1
            whileHover={{ scale: 1.05 }}
            className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md"
          >
            StealthMate <span className="text-yellow-300">AI</span>
          </motion.h1>
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="menu"
            onClick={() => setOpen((o) => !o)}
            className="p-2 hover:bg-white/20 rounded-md transition"
          >
            {open ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {/* Links */}
        <div
          className={`flex flex-col md:flex-row md:items-center gap-4 sm:gap-8 justify-end
            w-full md:w-auto transition-all duration-300 ${open ? "block" : "hidden"} md:flex`}
        >
          {/* Admin Panel button visible only for admins */}
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="bg-white text-pink-600 font-semibold px-5 py-2 rounded-xl hover:bg-pink-50 hover:text-pink-700 transition shadow-md"
              onClick={() => setOpen(false)}
            >
              Admin Panel
            </Link>
          )}

          {user && (
            <Link
              to="/dashboard"
              className="text-base font-medium hover:text-yellow-200 hover:underline transition"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          )}

          {user?.name && (
            <span className="font-medium text-base text-white/90">
              Welcome, {user.name.split(" ")[0]}
            </span>
          )}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2 rounded-xl shadow-lg transition transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col md:flex-row gap-3">
              <Link
                to="/login"
                className="bg-white text-pink-600 font-semibold px-5 py-2 rounded-xl hover:bg-pink-50 hover:text-pink-700 shadow-md transition transform hover:-translate-y-0.5"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-pink-600 font-semibold px-5 py-2 rounded-xl hover:bg-pink-50 hover:text-pink-700 shadow-md transition transform hover:-translate-y-0.5"
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
