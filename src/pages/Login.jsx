// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_name", data.user.name);
        localStorage.setItem("user_email", data.user.email);
        localStorage.setItem("user_plan", data.user.plan || "free");

        navigate("/dashboard");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Login failed.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold w-full py-2 rounded"
        >
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
        <p className="text-sm text-center mt-2">
  <button
    onClick={() => navigate("/")}
    className="text-gray-500 hover:underline"
    type="button"
  >
    🔙 Back to Home
  </button>
</p>

      </form>
    </div>
  );
}

export default Login;
