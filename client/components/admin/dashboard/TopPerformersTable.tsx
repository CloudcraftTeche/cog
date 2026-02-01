"use client";
import type {
  InsightsSectionProps,
  TopPerformer,
} from "@/types/admin/admindashboard.types";
import { TrendingUp } from "lucide-react";
interface TopPerformersTableProps {
  performers: TopPerformer[];
}
const TopPerformersTable = ({ performers }: TopPerformersTableProps) => {
  if (performers.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No top performers data available
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
              Rank
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
              Roll Number
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
              Completed Chapters
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
              Average Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {performers.map((student, index) => (
            <tr
              key={student.studentId}
              className="hover:bg-yellow-50/50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-bold text-gray-900">
                #{index + 1}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                {student.name || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {student.rollNumber || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-green-600">
                {student.completedChapters}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                {student.averageScore}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export const InsightsSection = ({ insights }: InsightsSectionProps) => {
  const topPerformers = insights?.topPerformers ?? [];
  return (
    <div className="space-y-10">
      {}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/50 to-orange-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-yellow-100/50">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Top Performing Students
              </h3>
              <p className="text-gray-500 font-medium">
                Based on chapter completion and scores
              </p>
            </div>
          </div>
          <TopPerformersTable performers={topPerformers} />
        </div>
      </div>
    </div>
  );
};
