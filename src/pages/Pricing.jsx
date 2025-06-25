// src/pages/Pricing.jsx
import { useNavigate } from "react-router-dom";

function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      title: "Free Trial",
      price: "₹0",
      limit: "3 Questions",
      features: ["Limited Access", "No Login Required", "Try Before Buy"],
    },
    {
      title: "Basic",
      price: "₹149/month",
      limit: "100 Questions/day",
      features: ["Access All Features", "Hindi & English", "Priority Accuracy"],
    },
    {
      title: "Pro",
      price: "₹299/month",
      limit: "200 Questions/day",
      features: ["Unlimited Use", "Fastest Replies", "Best AI Accuracy"],
    },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 p-6 flex flex-col items-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-6">💰 Choose Your Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-2xl p-6 border-2 border-yellow-300 hover:scale-105 transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">{plan.title}</h3>
            <p className="text-2xl font-bold text-yellow-600">{plan.price}</p>
            <p className="text-sm text-gray-600 mb-3">{plan.limit}</p>
            <ul className="text-sm text-gray-700 list-disc list-inside mb-4">
              {plan.features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
            {plan.title !== "Free Trial" ? (
              <button
                className="bg-yellow-500 text-white w-full py-2 rounded-lg font-semibold hover:bg-yellow-600"
                onClick={() => {
                  // In future: redirect to Razorpay/UPI checkout
                  alert(`🔒 Coming Soon: Pay for ${plan.title}`);
                }}
              >
                Subscribe
              </button>
            ) : (
              <button
                className="bg-gray-400 text-white w-full py-2 rounded-lg font-semibold hover:bg-gray-500"
                onClick={() => navigate("/dashboard")}
              >
                Try for Free
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pricing;
