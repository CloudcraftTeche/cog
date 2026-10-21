"use client";
import { RefreshCw } from "lucide-react";
import type {
  DashboardNavProps,
  DashboardView,
} from "@/types/admin/admindashboard.types";
interface NavButtonProps {
  view: DashboardView;
  currentView: DashboardView;
  onClick: () => void;
  label: string;
  activeGradient: string;
  hoverColor: string;
}
const NavButton = ({
  view,
  currentView,
  onClick,
  label,
  activeGradient,
  hoverColor,
}: NavButtonProps) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none px-3 sm:px-8 py-2 sm:py-3 text-sm sm:text-base rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
        isActive
          ? `bg-gradient-to-r ${activeGradient} text-white shadow-lg scale-105`
          : `text-gray-600 hover:bg-white/80 ${hoverColor} hover:scale-105`
      }`}
    >
      <span>{label}</span>
    </button>
  );
};
export const DashboardNav = ({
  selectedView,
  setSelectedView,
  refreshing,
  handleRefresh,
}: DashboardNavProps) => {
  const navItems: Array<{
    view: DashboardView;
    label: string;
    activeGradient: string;
    hoverColor: string;
    shadowColor: string;
  }> = [
    {
      view: "dashboard",
      label: "Overview",
      activeGradient: "from-purple-500 via-pink-500 to-blue-500",
      hoverColor: "hover:text-purple-600",
      shadowColor: "shadow-purple-200/50",
    },
    {
      view: "heatmap",
      label: "Heatmap",
      activeGradient: "from-orange-500 via-red-500 to-pink-500",
      hoverColor: "hover:text-orange-600",
      shadowColor: "shadow-orange-200/50",
    },
    {
      view: "reports",
      label: "Reports",
      activeGradient: "from-emerald-500 via-teal-500 to-cyan-500",
      hoverColor: "hover:text-emerald-600",
      shadowColor: "shadow-emerald-200/50",
    },
  ];
  return (
    <nav className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-3 py-4 sm:py-6">
          <div className="flex min-w-0 flex-1 sm:flex-none items-center">
            <div className="flex w-full gap-1 bg-gray-100/80 p-1 rounded-2xl backdrop-blur-sm">
              {navItems.map((item) => (
                <NavButton
                  key={item.view}
                  view={item.view}
                  currentView={selectedView}
                  onClick={() => setSelectedView(item.view)}
                  label={item.label}
                  activeGradient={item.activeGradient}
                  hoverColor={item.hoverColor}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex shrink-0 items-center gap-2 p-3 sm:px-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={
              refreshing ? "Refreshing data" : "Refresh dashboard data"
            }
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
