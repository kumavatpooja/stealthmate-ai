import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GoogleSuccess from "./pages/GoogleSuccess";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import PrivateRoute from "./routes/PrivateRoute";

import { useAuthContext } from "./context/AuthContext";
import useAuthSync from "./hooks/useAuthSync"; // ✅ added

import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  const { user } = useAuthContext();
  useAuthSync(); // ✅ added

  return (
    <>
      <ToastContainer />
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/register"
          element={<Register key={window.location.pathname} />}
        />
        <Route path="/google-success" element={<GoogleSuccess />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
     
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  );
};

export default App;
