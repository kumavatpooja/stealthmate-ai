import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import bgImage from "../assets/auth-bg.jpg";
import userIcon from "../assets/user-icon.png";
import useAuth from "../hooks/useAuth";
import useToast from "../hooks/useToast";

export default function LoginRegister() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // for registration
  const { login, register, loginWithGoogle } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isRegister) {
        if (!name || !email) return error("Please enter all fields");
        await register(name, email);
        success("Registration successful. Check email for OTP.");
      } else {
        if (!email) return error("Enter your email to login");
        await login(email);
        success("OTP sent! Check your inbox.");
      }
    } catch (err) {
      error(err.message || "Something went wrong");
    }
  };

  const handleGoogleLogin = async (res) => {
    try {
      await loginWithGoogle(res.credential);
      success("Logged in with Google");
      navigate("/dashboard");
    } catch (err) {
      error("Google login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left BG Image */}
        <div
          className="w-full md:w-1/2 h-80 md:h-auto bg-cover bg-center relative hidden md:block"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute bottom-5 left-5 text-white text-xl font-semibold drop-shadow-md">
            Smart Help, Smart Hire.
          </div>
        </div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          {/* User Icon */}
          <div className="flex justify-center mb-6">
            <img src={userIcon} alt="user" className="w-16 h-16" />
          </div>

          <h2 className="text-2xl font-bold text-center text-secondary mb-4">
            {isRegister ? "Create an Account" : "Login to Continue"}
          </h2>

          <p className="text-sm text-gray-600 text-center mb-8">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-primary font-medium underline"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-primary font-medium underline"
                >
                  Register
                </button>
              </>
            )}
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-primary"
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-primary"
            />

            {isRegister && (
              <>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full px-4 py-2 text-black bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring focus:ring-primary"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2 text-sm text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <label className="text-xs text-gray-500 block">
                  By registering, you agree to our{" "}
                  <Link to="/terms" className="underline text-secondary">
                    Terms
                  </Link>
                </label>
              </>
            )}

            {!isRegister && (
              <Link to="/forgot-password" className="text-sm text-secondary underline">
                Forgot Password?
              </Link>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg shadow transition"
            >
              {isRegister ? "Create Account" : "Send OTP"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="text-sm text-gray-500">or continue with</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleLogin} onError={() => error("Google Login Failed")} />
          </div>
        </div>
      </div>
    </div>
  );
}
