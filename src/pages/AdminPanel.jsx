// src/pages/AdminPanel.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function AdminPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("user_email");
    if (email !== "admin@stealthmate.ai") {
      alert("Access Denied! Only admin can view this page.");
      navigate("/");
    }
  }, []);

  const mockUsers = [
    {
      name: "Pooja Kumavat",
      email: "pooja@example.com",
      plan: "Pro ₹299",
      resume: true,
    },
    {
      name: "Demo User",
      email: "demo@user.com",
      plan: "Free",
      resume: false,
    },
    {
      name: "Test User",
      email: "test@example.com",
      plan: "Basic ₹149",
      resume: true,
    },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">👨‍💼 Admin Panel</h2>

      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Plan</th>
              <th className="border px-4 py-2 text-left">Resume Uploaded?</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, idx) => (
              <tr key={idx} className="hover:bg-yellow-100">
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.plan}</td>
                <td className="border px-4 py-2">
                  {user.resume ? "✅ Yes" : "❌ No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 text-sm text-blue-600 underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default AdminPanel;
