"use client";
import { BarChart3, Calendar, FileSpreadsheet } from "lucide-react";

interface NavigationProps {
  selectedView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ selectedView, onViewChange }: NavigationProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "heatmap", label: "Heatmap", icon: Calendar },
    { id: "records", label: "Records", icon: FileSpreadsheet },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onViewChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedView === tab.id
                      ? "bg-purple-100 text-purple-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}