import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginRegister from "./pages/LoginRegister";
import Pricing from "./pages/Pricing";
import ResumeUpload from "./pages/ResumeUpload";
import Dashboard from "./pages/Dashboard";
import LiveInterview from "./pages/LiveInterview";
import History from "./pages/History";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";
import TermsAndCondition from "./pages/TermsAndCondition";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import GoogleDocHelp from "./pages/GoogleDocHelp";
import ForgotPassword from "./pages/ForgotPassword"; // ✅ NEW: fallback
import NotFound from "./pages/NotFound";             // ✅ NEW: 404 fallback
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<LoginRegister />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/live-interview" element={<LiveInterview />} />
        <Route path="/history" element={<History />} />
        <Route path="/support" element={<Support />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<TermsAndCondition />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund" element={<RefundPolicy />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/google-help" element={<GoogleDocHelp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ Fix route error */}

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
