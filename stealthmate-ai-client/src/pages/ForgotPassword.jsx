import { Link } from "react-router-dom";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-secondary mb-6">
          Forgot Password?
        </h2>

        <p className="text-sm text-gray-600 text-center mb-4">
          Enter your registered email address. We'll send you a password reset link.
        </p>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary"
          />

          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-white font-semibold py-2 rounded-lg shadow transition"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
