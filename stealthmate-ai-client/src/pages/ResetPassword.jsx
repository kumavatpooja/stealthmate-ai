import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:10000/api/auth/reset-password", {
        token,
        newPassword,
      });
      alert("Password reset successful!");
      navigate("/login");
    } catch (err) {
      alert("Invalid or expired token");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-secondary mb-6">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary"
          />

          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
