// src/pages/Dashboard.jsx
import React from "react";

const colors = [
  { name: "Primary", class: "bg-primary", text: "text-white" },
  { name: "Secondary", class: "bg-secondary", text: "text-white" },
  { name: "Accent", class: "bg-accent", text: "text-white" },
  { name: "Muted", class: "bg-muted", text: "text-black" },
  { name: "Card", class: "bg-card", text: "text-black" },
  { name: "Background", class: "bg-background", text: "text-black" },
  { name: "Text Light", class: "bg-white", text: "text-textLight" },
  { name: "Text Dark", class: "bg-black", text: "text-textDark" },
];

export default function Dashboard() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-center">Color Theme Showcase</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`${color.class} ${color.text} p-6 rounded-xl shadow-lg flex items-center justify-center h-28`}
          >
            <span className="text-lg font-semibold">{color.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
