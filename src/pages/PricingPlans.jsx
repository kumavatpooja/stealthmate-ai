// src/pages/PricingPlans.jsx
import { openRazorpayCheckout } from "../utils/razorpay";

function PricingPlans() {
  return (
    <div className="min-h-screen bg-yellow-50 p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Choose Your Plan</h2>

      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <div className="bg-white p-6 rounded-xl shadow text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Basic Plan</h3>
          <p className="text-gray-700 mb-4">100 questions per day</p>
          <p className="text-gray-800 font-bold mb-4">₹149/month</p>
          <button
            onClick={() => openRazorpayCheckout("Basic")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
          >
            Buy Basic
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white p-6 rounded-xl shadow text-left">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Pro Plan</h3>
          <p className="text-gray-700 mb-4">200 questions per day</p>
          <p className="text-gray-800 font-bold mb-4">₹299/month</p>
          <button
            onClick={() => openRazorpayCheckout("Pro")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded"
          >
            Buy Pro
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingPlans;
