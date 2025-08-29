import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users & payments
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // Security check: Only admin role can access
    if (!token || storedUser?.role !== "admin") {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [usersRes, paymentsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/payments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const usersData = await usersRes.json();
        const paymentsData = await paymentsRes.json();

        setUsers(usersData);
        setPayments(paymentsData);
        setLoading(false);
      } catch (error) {
        console.error("Error loading admin data", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <p className="p-6">Loading admin data...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-yellow-600 mb-6">Admin Dashboard</h1>

      {/* Users Table */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-2">Registered Users</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-yellow-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Plan</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.plan || "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payments Table */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Payment Logs</h2>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-yellow-200">
              <tr>
                <th className="p-3 text-left">User Email</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b">
                  <td className="p-3">{p.userEmail}</td>
                  <td className="p-3">₹{p.amount}</td>
                  <td className="p-3">
                    {new Date(p.createdAt).toLocaleDateString()}{" "}
                    {new Date(p.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
