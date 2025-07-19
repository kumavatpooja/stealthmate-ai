import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 text-center p-6">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Oops! Page Not Found
      </h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-2 bg-primary hover:bg-secondary text-white font-semibold rounded-lg shadow transition"
      >
        Go to Home
      </Link>
    </div>
  );
}
