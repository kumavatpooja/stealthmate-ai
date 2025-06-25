export const openRazorpayCheckout = (plan) => {
    const options = {
      key: "rzp_test_1234567890abcdef", // ✅ Keep default for now
      amount: plan === "Pro" ? 29900 : 14900,
      currency: "INR",
      name: "StealthMate AI",
      description: `${plan} Plan Subscription`,
      handler: function (response) {
        alert("✅ Payment Successful!");
        localStorage.setItem("user_plan", plan + " (Paid)");
        window.location.href = "/dashboard";
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
  