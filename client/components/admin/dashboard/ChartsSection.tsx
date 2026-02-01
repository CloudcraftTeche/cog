"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { PieChartIcon, BarChart3, TrendingUp, Activity } from "lucide-react";
import { ChartsSectionProps } from "@/types/admin/admindashboard.types";
const CHART_COLORS = [
  "#8b5cf6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#84cc16",
];
const TOOLTIP_STYLE = {
  backgroundColor: "rgba(255, 255, 255, 0.98)",
  border: "none",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  backdropFilter: "blur(20px)",
};
export const ChartsSection = ({ charts }: ChartsSectionProps) => {
  const gradeDistribution = charts?.gradeDistribution ?? [];
  const assignmentStats = charts?.assignmentStats ?? [];
  const studentGrowth = charts?.studentGrowth ?? [];
  const teacherGrowth = charts?.teacherGrowth ?? [];
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-purple-100/50 hover:shadow-purple-500/10 transition-all duration-500">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
                <PieChartIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Students by Grade
                </h3>
                <p className="text-gray-500 font-medium">
                  Distribution across all grades
                </p>
              </div>
            </div>
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={gradeDistribution.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ grade, studentCount }) =>
                      `${grade ?? "N/A"} (${studentCount ?? 0})`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="studentCount"
                    strokeWidth={4}
                    stroke="#fff"
                  >
                    {gradeDistribution.slice(0, 8).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">
                    No grade distribution data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-blue-100/50 hover:shadow-blue-500/10 transition-all duration-500">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Assignment Status
                </h3>
                <p className="text-gray-500 font-medium">Assignment overview</p>
              </div>
            </div>
            {assignmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={assignmentStats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0e7ff"
                    strokeWidth={1}
                  />
                  <XAxis dataKey="status" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">
                    No assignment data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
        {}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/50 to-teal-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-emerald-100/50 hover:shadow-emerald-500/10 transition-all duration-500">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Student Growth
                </h3>
                <p className="text-gray-500 font-medium">
                  Monthly enrollment trends
                </p>
              </div>
            </div>
            {studentGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={studentGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e0f2fe"
                    strokeWidth={1}
                  />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="students"
                    fill="url(#colorGradient)"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#059669"
                    strokeWidth={4}
                    dot={{ fill: "#059669", strokeWidth: 3, r: 6 }}
                    activeDot={{
                      r: 8,
                      stroke: "#059669",
                      strokeWidth: 3,
                    }}
                  />
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">
                    No growth data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-red-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-orange-100/50 hover:shadow-orange-500/10 transition-all duration-500">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Teacher Growth
                </h3>
                <p className="text-gray-500 font-medium">
                  Monthly hiring trends
                </p>
              </div>
            </div>
            {teacherGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={teacherGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#fef3c7"
                    strokeWidth={1}
                  />
                  <XAxis dataKey="month" stroke="#92400e" fontSize={12} />
                  <YAxis stroke="#92400e" fontSize={12} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="teachers"
                    stroke="#f59e0b"
                    strokeWidth={4}
                    fill="url(#colorOrange)"
                  />
                  <defs>
                    <linearGradient
                      id="colorOrange"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop
                        offset="95%"
                        stopColor="#f59e0b"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">
                    No growth data available
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
