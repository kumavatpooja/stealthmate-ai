// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Registered successfully. Please log in.");
        navigate("/login");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("Something went wrong during registration.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">📝 Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 p-2 border border-gray-300 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          Register
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
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

export default Register;
