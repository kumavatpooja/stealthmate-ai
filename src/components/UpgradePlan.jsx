// src/components/UpgradePlan.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UpgradePlan() {
  const navigate = useNavigate();

  const handlePayment = async (amount, planName) => {
    const key = "rzp_test_XXXXXXXXXXXXXXXX"; // Replace later with LIVE Key

    const options = {
      key,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "StealthMate AI",
      description: `Upgrade to ${planName}`,
      handler: function (response) {
        alert("✅ Payment Successful! Plan Activated.");
        localStorage.setItem("user_plan", planName);
        localStorage.setItem("payment_id", response.razorpay_payment_id);
        navigate("/dashboard");
      },
      prefill: {
        name: localStorage.getItem("user_name") || "",
        email: localStorage.getItem("user_email") || "",
      },
      theme: {
        color: "#facc15",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Upgrade Your Plan</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Basic Plan */}
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Basic Plan</h3>
          <p className="mb-4 text-gray-600">Get 100 AI Interview Answers/Day</p>
          <p className="text-2xl font-semibold mb-4">₹149 / month</p>
          <button
            onClick={() => handlePayment(149, "Basic ₹149")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Upgrade to Basic
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Pro Plan</h3>
          <p className="mb-4 text-gray-600">Get 200 AI Interview Answers/Day</p>
          <p className="text-2xl font-semibold mb-4">₹299 / month</p>
          <button
            onClick={() => handlePayment(299, "Pro ₹299")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpgradePlan;
