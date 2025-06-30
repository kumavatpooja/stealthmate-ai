import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await fetch("http://localhost:5000/api/interview/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setHistory(data);
        } else {
          alert("❌ Failed to load history");
        }
      } catch (err) {
        console.error("❌ Error fetching history:", err);
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">📄 Interview History</h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-600">No interview history yet.</p>
      ) : (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {history.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">
                🕒 {new Date(item.createdAt).toLocaleString()}
              </p>
              <p className="font-semibold text-gray-800">❓ {item.question}</p>
              <p className="mt-2 text-blue-800">📝 Your Answer: {item.answer}</p>
              <p className="mt-1 text-green-700">💡 GPT Feedback: {item.modelAnswer}</p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-5 py-2 rounded-xl"
        >
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default History;
