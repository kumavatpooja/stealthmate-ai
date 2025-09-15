import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  LogOut,
  Bot,
  UserCircle,
  History,
  Menu,
  X,
  Upload,
} from "lucide-react";
import axios from "../utils/axios"; // ✅ axios instance

/* Sidebar Item */
const SidebarItem = ({ icon: Icon, label, to }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 rounded-lg transition hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50"
  >
    <div className="w-8 h-8 rounded-md bg-white/70 shadow-sm flex items-center justify-center text-purple-600">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-sm font-medium text-gray-800">{label}</span>
  </Link>
);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [mockOpen, setMockOpen] = useState(false);
  const [resumeStatus, setResumeStatus] = useState(null); // ✅ resume info
  const navigate = useNavigate();

  // Mock state
  const [domain, setDomain] = useState("Frontend");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(20);

  const userName = "Pooja Kumavat";
  const userPlan = "Pro";
  const usedQuestions = 2380;

  const startMockInterview = () => {
    console.log("Start Mock Interview", { domain, difficulty, duration });
    setMockOpen(false);
  };

  // ✅ Fetch Resume Status on load
  useEffect(() => {
    const fetchResume = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("/resume/confirm", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResumeStatus(res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setResumeStatus(null); // no resume uploaded
        } else {
          console.error("❌ Resume fetch error:", err.message);
        }
      }
    };
    fetchResume();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* ---------- Mobile overlay ---------- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed lg:static z-40 bg-white shadow-lg h-full transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-0 lg:w-64"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            StealthMate AI
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:bg-gray-100 rounded p-1"
          >
            <X />
          </button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          <SidebarItem icon={Home} label="Overview" to="/dashboard" />
          <SidebarItem icon={Bot} label="Live Interview" to="/interview" />
          <SidebarItem icon={History} label="History" to="/history" />
          <SidebarItem icon={FileText} label="Subscription Plans" to="/pricing" />
          <SidebarItem icon={Upload} label="Resume Upload" to="/resume-upload" />
          <div className="mt-auto">
            <SidebarItem icon={LogOut} label="Logout" to="/logout" />
          </div>
        </nav>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* mobile menu btn */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md bg-white shadow hover:bg-gray-100"
            >
              <Menu />
            </button>
            <div>
              <h2 className="text-2xl font-semibold">
                Welcome, {userName} <span>👋</span>
              </h2>
              <p className="text-sm text-gray-500">
                Explore your AI dashboard and tools.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 shadow-sm">
              Plan: {userPlan}
            </div>
            <UserCircle className="w-9 h-9 text-gray-600" />
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            label="Used Questions"
            value={usedQuestions}
            accent="from-pink-400 to-purple-500"
            emoji="❓"
          />
          <StatCard
            label="Requests Today"
            value={15}
            accent="from-purple-400 to-pink-400"
            emoji="📅"
          />
          <StatCard
            label="Subscription Status"
            value="Active"
            accent="from-green-400 to-green-600"
            emoji="✨"
          />
          <StatCard
            label="Resume Status"
            value={
              resumeStatus
                ? `Uploaded ✅ (${resumeStatus.jobRole || "No Role"})`
                : "Not Uploaded ❌"
            }
            accent="from-purple-400 to-pink-500"
            emoji="📄"
          />
        </section>

        {/* Tools */}
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-4">🚀 AI Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard
              title="🎤 AI Live Interview"
              subtitle="Live voice + text interviews"
              gradient="from-purple-500 to-pink-500"
              onClick={() => (window.location.href = "/interview")}
              badge="Live"
            />
            <ToolCard
              title="🧑‍💼 Mock Interview"
              subtitle="Practice with scoring & feedback"
              gradient="from-pink-500 to-purple-500"
              onClick={() => setMockOpen(true)}
              badge="Try"
              emphasize
            />
            <ToolCard
              title="📜 History"
              subtitle="View your past sessions"
              gradient="from-purple-300 to-pink-300"
              onClick={() => (window.location.href = "/history")}
            />
            <ToolCard
              title="💳 Subscription Plans"
              subtitle="Manage or upgrade plan"
              gradient="from-yellow-400 to-pink-400"
              onClick={() => (window.location.href = "/pricing")}
            />
            <ToolCard
              title="📄 Resume Upload"
              subtitle="Upload or update your resume"
              gradient="from-pink-400 to-purple-400"
              onClick={() => navigate("/resume-upload")}
              badge={resumeStatus ? "Update" : "New"}
            />
          </div>
        </section>
      </main>

      {/* ---------- Bottom Navigation (Mobile only) ---------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t shadow-md flex justify-around items-center py-2 z-50">
        <BottomNavItem to="/dashboard" icon={Home} label="Home" />
        <BottomNavItem to="/interview" icon={Bot} label="Interview" />
        <BottomNavItem to="/history" icon={History} label="History" />
        <BottomNavItem to="/pricing" icon={FileText} label="Plans" />
        <BottomNavItem to="/resume-upload" icon={Upload} label="Resume" />
      </nav>
    </div>
  );
}

/* Helpers */
function StatCard({ label, value, accent = "from-pink-400 to-purple-500", emoji }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="flex items-center gap-3 mt-2">
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <div
          className={`p-2 rounded-md bg-gradient-to-br ${accent} text-white text-lg shadow-sm`}
        >
          {emoji}
        </div>
      </div>
    </div>
  );
}

function ToolCard({ title, subtitle, gradient, onClick, badge, emphasize }) {
  return (
    <button
      onClick={onClick}
      className="group relative text-left p-6 rounded-2xl border border-gray-200 bg-white hover:shadow-2xl transition transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${gradient} transform group-hover:rotate-6 transition`}
            >
              {title[0]}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>
          </div>
        </div>
        {badge && (
          <div
            className={`text-xs font-semibold px-2 py-1 rounded-lg ${
              emphasize ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {badge}
          </div>
        )}
      </div>
      <div className="mt-4 text-xs text-gray-400">Tap to open</div>
    </button>
  );
}

/* Bottom Nav Item */
function BottomNavItem({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center text-gray-600 hover:text-purple-600 transition"
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}
