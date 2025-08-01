import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import robo from "../assets/robo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // debug: confirm user updates
    console.log("Navbar sees user:", user);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-gradient-to-r from-[#ec4899] via-fuchsia-600 to-[#9c48e1] shadow-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 sm:px-12 py-4 text-white">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-3">
          <img src={robo} alt="logo" className="w-9 sm:w-11" />
          <motion.h1
            whileHover={{ scale: 1.03 }}
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            StealthMate <span className="text-yellow-300">AI</span>
          </motion.h1>
        </Link>

        {/* Right menu */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-end">
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="bg-white text-pink-600 font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg hover:bg-pink-100 transition duration-200 shadow-sm"
            >
              Admin Panel
            </Link>
          )}

          {user && (
            <Link
              to="/dashboard"
              className="text-sm sm:text-base font-medium hover:underline hover:text-yellow-200 transition"
            >
              Dashboard
            </Link>
          )}

          {user?.name && (
            <span className="hidden sm:inline-block font-medium text-sm">
              Welcome, {user.name.split(" ")[0]}
            </span>
          )}

          {/* Auth Buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="bg-white text-pink-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-pink-100 transition duration-200 shadow-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-pink-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-pink-100 transition duration-200 shadow-sm"
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
