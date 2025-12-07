import { BarChart3, Activity, ClipboardList, RefreshCw } from "lucide-react";

interface DashboardNavProps {
  selectedView: string;
  setSelectedView: (view: string) => void;
  refreshing: boolean;
  handleRefresh: () => void;
}

export const DashboardNav = ({
  selectedView,
  setSelectedView,
  refreshing,
  handleRefresh,
}: DashboardNavProps) => {
  return (
    <nav className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-8">
            <div className="flex space-x-1 bg-gray-100/80 p-1 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => setSelectedView("dashboard")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === "dashboard"
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white shadow-lg shadow-purple-200/50 scale-105"
                    : "text-gray-600 hover:bg-white/80 hover:text-purple-600 hover:scale-105"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setSelectedView("heatmap")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === "heatmap"
                    ? "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-lg shadow-orange-200/50 scale-105"
                    : "text-gray-600 hover:bg-white/80 hover:text-orange-600 hover:scale-105"
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Heatmap</span>
              </button>
              <button
                onClick={() => setSelectedView("reports")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  selectedView === "reports"
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-lg shadow-emerald-200/50 scale-105"
                    : "text-gray-600 hover:bg-white/80 hover:text-emerald-600 hover:scale-105"
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span>Reports</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};