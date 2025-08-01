import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  FileText,
  Settings,
  LogOut,
  Bot,
  UserCircle,
  BarChart,
} from "lucide-react";

const SidebarItem = ({ icon: Icon, label, to }) => (
  <Link to={to} className="flex items-center gap-3 p-3 hover:bg-gray-200 rounded-lg">
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userName = "Pooja Kumavat"; // dynamically fetch
  const userPlan = "Pro"; // dynamically fetch
  const tokenUsage = 2380; // dynamically fetch

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-white shadow-md transition-all ${sidebarOpen ? "w-64" : "w-16"} duration-300`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className={`text-xl font-bold text-purple-600 ${!sidebarOpen && "hidden"}`}>StealthMate AI</h1>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
            ☰
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <SidebarItem icon={Home} label="Overview" to="/dashboard" />
          <SidebarItem icon={Bot} label="Live Interview" to="/interview" />
          <SidebarItem icon={FileText} label="Resume Tools" to="/resume" />
          <SidebarItem icon={BarChart} label="Usage" to="/usage" />
          <SidebarItem icon={Settings} label="Settings" to="/settings" />
          <SidebarItem icon={LogOut} label="Logout" to="/logout" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Top navbar */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Welcome, {userName} 👋</h2>
            <p className="text-sm text-gray-500">Explore your AI dashboard and tools.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
              Plan: {userPlan}
            </div>
            <UserCircle className="w-8 h-8 text-gray-600" />
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">Used Tokens</p>
            <h3 className="text-2xl font-bold text-purple-700">{tokenUsage}</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">Requests Today</p>
            <h3 className="text-2xl font-bold text-purple-700">15</h3>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-500">Subscription Status</p>
            <h3 className="text-2xl font-bold text-green-600">Active</h3>
          </div>
        </section>

        {/* Tools */}
        <section className="mt-10">
          <h3 className="text-lg font-semibold mb-4">AI Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ToolCard title="AI Live Interview" to="/interview" />
            <ToolCard title="Resume Analyzer" to="/resume" />
            <ToolCard title="Subscription Plans" to="/pricing" />
          </div>
        </section>
      </main>
    </div>
  );
}

function ToolCard({ title, to }) {
  return (
    <Link
      to={to}
      className="bg-white hover:shadow-md transition-all p-5 rounded-2xl border border-gray-200"
    >
      <h4 className="text-lg font-medium text-gray-800 mb-2">{title}</h4>
      <p className="text-sm text-gray-500">Tap to open</p>
    </Link>
  );
}
