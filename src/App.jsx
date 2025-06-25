import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import UploadResume from './pages/UploadResume';
import AddExtraInfo from './pages/AddExtraInfo';
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Interview from "./pages/Interview";
import SetAPIKey from "./pages/SetAPIKey";
import Login from './pages/Login';
import Register from './pages/Register';
import PricingPlans from './pages/PricingPlans';
import UpgradePlan from "./components/UpgradePlan";
import AdminPanel from './pages/AdminPanel';

import PrivateRoute from './components/PrivateRoute'; // 🔐 Auth guard

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminPanel />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <PrivateRoute>
              <UploadResume />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-extra-info"
          element={
            <PrivateRoute>
              <AddExtraInfo />
            </PrivateRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <PrivateRoute>
              <Pricing />
            </PrivateRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <PrivateRoute>
              <PricingPlans />
            </PrivateRoute>
          }
        />
        <Route
          path="/upgrade"
          element={
            <PrivateRoute>
              <UpgradePlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <PrivateRoute>
              <Interview />
            </PrivateRoute>
          }
        />
        <Route
          path="/set-api-key"
          element={
            <PrivateRoute>
              <SetAPIKey />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
