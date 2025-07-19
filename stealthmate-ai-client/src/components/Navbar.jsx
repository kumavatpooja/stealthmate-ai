import { useState } from "react";
import { Link } from "react-router-dom";
import roboGif from "../assets/robo.gif";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <nav className="w-full bg-gradient-to-r from-secondary to-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={roboGif} alt="bot" className="h-20 w-20 animate-bounce" />
          <span className="text-3xl font-extrabold text-white tracking-wide">
            StealthMate <span className="text-cta">AI</span>
          </span>
        </Link>

        {/* Hamburger menu */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 items-center">
          {isAuthenticated && (
            <Link to="/dashboard" className="text-white hover:text-cta transition">
              Dashboard
            </Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="text-white hover:text-cta transition">
              Admin Panel
            </Link>
          )}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-white hover:text-cta transition">
                Login
              </Link>
              <Link
                to="/register"
                className="ml-2 px-4 py-1.5 bg-white text-secondary font-bold rounded-full shadow hover:bg-cta hover:text-white transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-white font-medium">
                👋 Hi, {user?.name || "User"}
                {isAdmin && " (Admin)"}
              </span>
              <button
                onClick={logout}
                className="ml-3 text-white hover:text-cta font-medium transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile links */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 bg-primary text-white transition-all duration-300">
          {isAuthenticated && (
            <Link to="/dashboard" className="hover:text-cta">Dashboard</Link>
          )}
          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="hover:text-cta">Admin Panel</Link>
          )}
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="hover:text-cta">Login</Link>
              <Link
                to="/register"
                className="mt-1 px-4 py-1.5 text-center bg-white text-secondary font-bold rounded-full shadow hover:bg-cta hover:text-white transition"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-white">
                👋 Hi, {user?.name}{isAdmin && " (Admin)"}
              </span>
              <button
                onClick={logout}
                className="mt-2 text-left hover:text-cta"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
