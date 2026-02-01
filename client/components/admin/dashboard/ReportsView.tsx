"use client";
import { Announcement, Query, ReportsViewProps } from "@/types/admin/admindashboard.types";
import { formatDate, getPriorityStats, getStatusColor } from "@/utils/admin/Dashboard.utils";
import {
  ClipboardList,
  AlertTriangle,
  Megaphone,
  MessageSquare,
} from "lucide-react";

interface PriorityStatsCardProps {
  icon: typeof AlertTriangle;
  value: number;
  label: string;
  gradient: string;
  borderColor: string;
  iconGradient: string;
}

const PriorityStatsCard = ({
  icon: Icon,
  value,
  label,
  gradient,
  borderColor,
  iconGradient,
}: PriorityStatsCardProps) => (
  <div className="relative group">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}/20 rounded-2xl blur-lg`}></div>
    <div className={`relative bg-gradient-to-br ${gradient} border-l-8 ${borderColor} p-8 rounded-2xl shadow-xl hover:shadow-${borderColor.split('-')[1]}-500/10 transition-all duration-300`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className={`font-black text-${borderColor.split('-')[1]}-800 text-2xl`}>
            {value}
          </h4>
          <p className={`text-${borderColor.split('-')[1]}-700 font-semibold`}>
            {label}
          </p>
        </div>
      </div>
    </div>
  </div>
);

interface AnnouncementTableProps {
  announcements: Announcement[];
}

const AnnouncementTable = ({ announcements }: AnnouncementTableProps) => {
  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-500">
          No recent announcements available
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl shadow-2xl border border-gray-200/50">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white/95 backdrop-blur-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                Title
              </th>
              <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                Date Posted
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/95 divide-y divide-gray-200/50">
            {announcements.map((announcement) => (
              <tr
                key={announcement._id}
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300"
              >
                <td className="px-8 py-6 text-sm font-bold text-gray-900">
                  {announcement.title || "N/A"}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-semibold">
                  {formatDate(announcement.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface QueryTableProps {
  queries: Query[];
}

const QueryTable = ({ queries }: QueryTableProps) => {
  if (queries.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-semibold text-gray-500">
          No recent queries available
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl shadow-2xl border border-gray-200/50">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white/95 backdrop-blur-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                From
              </th>
              <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-6 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/95 divide-y divide-gray-200/50">
            {queries.map((query) => (
              <tr
                key={query._id}
                className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300"
              >
                <td className="px-8 py-6 text-sm font-bold text-gray-900">
                  {query.subject || "N/A"}
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-semibold">
                  {query.from?.name || "Anonymous"}
                </td>
                <td className="px-8 py-6 whitespace-nowrap">
                  <span
                    className={`inline-flex px-4 py-2 text-sm font-bold rounded-2xl shadow-lg ${getStatusColor(
                      query.status
                    )}`}
                  >
                    {query.status || "N/A"}
                  </span>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600 font-semibold">
                  {formatDate(query.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ReportsView = ({
  recentAnnouncements = [],
  recentQueries = [],
}: ReportsViewProps) => {
  const stats = getPriorityStats(recentQueries);

  return (
    <div className="space-y-10">
      {/* Priority Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PriorityStatsCard
          icon={AlertTriangle}
          value={stats.urgent}
          label="Urgent Queries"
          gradient="from-red-50 to-pink-50"
          borderColor="border-red-500"
          iconGradient="from-red-500 to-red-600"
        />
        <PriorityStatsCard
          icon={ClipboardList}
          value={stats.pending}
          label="Pending Queries"
          gradient="from-yellow-50 to-amber-50"
          borderColor="border-yellow-500"
          iconGradient="from-yellow-500 to-yellow-600"
        />
        <PriorityStatsCard
          icon={MessageSquare}
          value={stats.resolved}
          label="Resolved Queries"
          gradient="from-green-50 to-emerald-50"
          borderColor="border-green-500"
          iconGradient="from-green-500 to-green-600"
        />
      </div>

      {/* Recent Announcements */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-blue-100/50">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-lg">
              <Megaphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Recent Announcements
              </h3>
              <p className="text-gray-500 font-medium text-lg">
                Latest updates and notifications
              </p>
            </div>
          </div>
          <AnnouncementTable announcements={recentAnnouncements} />
        </div>
      </div>

      {/* Recent Queries */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200/50 to-pink-200/50 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
        <div className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-purple-100/50">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Recent Queries
              </h3>
              <p className="text-gray-500 font-medium text-lg">
                Student and teacher queries
              </p>
            </div>
          </div>
          <QueryTable queries={recentQueries} />
        </div>
      </div>
    </div>
  );
};