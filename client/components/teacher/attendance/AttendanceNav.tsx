"use client";
interface AttendanceNavProps {
  selectedView: "attendance" | "today" | "stats" | "history";
  onViewChange: (view: "attendance" | "today" | "stats" | "history") => void;
}
export default function AttendanceNav({ selectedView, onViewChange }: AttendanceNavProps) {
  const navItems = [
    { id: "attendance", label: "Mark Attendance" },
    { id: "today", label: "Today's Summary" },
    { id: "stats", label: "Statistics" },
    { id: "history", label: "History" },
  ] as const;
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Attendance Management
            </h1>
            <div className="flex space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedView === item.id
                      ? "bg-emerald-100 text-emerald-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}