import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "lucide-react";
interface HeatmapViewProps {
  heatmapData?: any[];
  attendanceTrend?: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
    total?: number;
    attendanceRate?: number;
  }>;
}
export const HeatmapView = ({ heatmapData, attendanceTrend }: HeatmapViewProps) => {
  const data = attendanceTrend && attendanceTrend.length > 0 
    ? attendanceTrend 
    : heatmapData ?? [];
  const chartData = data.map(item => {
    if ('_id' in item) {
      return {
        date: item._id,
        present: item.present ?? 0,
        late: item.late ?? 0,
        absent: item.absent ?? 0,
      };
    }
    return {
      date: item.date,
      present: item.present ?? 0,
      late: item.late ?? 0,
      absent: item.absent ?? 0,
    };
  });
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-200/50 to-red-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
      <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-orange-100/50">
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-lg">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Attendance Heatmap - Last 30 Days
            </h3>
            <p className="text-gray-500 font-medium text-lg">
              Visual attendance pattern analysis
            </p>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={550}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#fef3c7"
                strokeWidth={1}
              />
              <XAxis dataKey="date" stroke="#92400e" fontSize={12} />
              <YAxis stroke="#92400e" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  border: "none",
                  borderRadius: "20px",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                  backdropFilter: "blur(20px)",
                }}
              />
              <Bar
                dataKey="present"
                stackId="a"
                fill="#10b981"
                radius={[0, 0, 6, 6]}
              />
              <Bar
                dataKey="late"
                stackId="a"
                fill="#f59e0b"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="absent"
                stackId="a"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[550px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold">
                No heatmap data available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};