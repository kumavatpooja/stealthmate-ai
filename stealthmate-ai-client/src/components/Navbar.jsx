import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import robo from "../assets/robo.png";
import { FiMenu, FiX } from "react-icons/fi"; // install lucide or react-icons if not already

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.log("Navbar sees user:", user);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-gradient-to-r from-[#ec4899] via-fuchsia-600 to-[#9c48e1] shadow-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-12 py-3 text-white">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-2">
          <img src={robo} alt="logo" className="w-8 sm:w-11" />
          <motion.h1
            whileHover={{ scale: 1.03 }}
            className="text-lg sm:text-2xl font-bold tracking-tight"
          >
            StealthMate <span className="text-yellow-300">AI</span>
          </motion.h1>
        </Link>

        {/* Hamburger for mobile */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="menu"
            onClick={() => setOpen((o) => !o)}
            className="p-2"
          >
            {open ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop + mobile menu */}
        <div
          className={`
            flex flex-col md:flex-row md:items-center gap-3 sm:gap-6
            justify-end
            w-full md:w-auto
            transition-all
            ${open ? "block" : "hidden"} md:flex
          `}
        >
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="bg-white text-pink-600 font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg hover:bg-pink-100 transition duration-200 shadow-sm"
              onClick={() => setOpen(false)}
            >
              Admin Panel
            </Link>
          )}

          {user && (
            <Link
              to="/dashboard"
              className="text-sm sm:text-base font-medium hover:underline hover:text-yellow-200 transition"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
          )}

          {user?.name && (
            <span className="font-medium text-sm">
              Welcome, {user.name.split(" ")[0]}
            </span>
          )}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col md:flex-row gap-2">
              <Link
                to="/login"
                className="bg-white text-pink-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-pink-100 transition duration-200 shadow-sm"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-pink-600 font-semibold px-4 py-1.5 rounded-lg hover:bg-pink-100 transition duration-200 shadow-sm"
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
