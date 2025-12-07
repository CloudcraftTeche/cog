import { ClipboardList, AlertTriangle, Megaphone, MessageSquare } from "lucide-react";
import { format } from "date-fns";
interface Announcement {
  _id: string;
  title: string;
  createdAt: string;
}
interface Query {
  _id: string;
  subject: string;
  status: string;
  createdAt: string;
  from?: {
    name?: string;
  };
}
interface ReportsViewProps {
  recentAnnouncements?: Announcement[];
  recentQueries?: Query[];
}
export const ReportsView = ({ 
  recentAnnouncements = [], 
  recentQueries = [] 
}: ReportsViewProps) => {
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
      case "completed":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200";
      case "pending":
      case "in_progress":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-2 border-yellow-200";
      case "cancelled":
      case "rejected":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-200";
    }
  };
  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };
  const getPriorityStats = () => {
    const urgent = recentQueries.filter(q => 
      q.subject?.toLowerCase().includes('urgent') || 
      q.subject?.toLowerCase().includes('emergency')
    ).length;
    const pending = recentQueries.filter(q => 
      q.status?.toLowerCase() === 'pending'
    ).length;
    const resolved = recentQueries.filter(q => 
      q.status?.toLowerCase() === 'resolved'
    ).length;
    return { urgent, pending, resolved };
  };
  const stats = getPriorityStats();
  return (
    <div className="space-y-10">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-2xl blur-lg"></div>
          <div className="relative bg-gradient-to-br from-red-50 to-pink-50 border-l-8 border-red-500 p-8 rounded-2xl shadow-xl hover:shadow-red-500/10 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-red-800 text-2xl">{stats.urgent}</h4>
                <p className="text-red-700 font-semibold">Urgent Queries</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-400/20 rounded-2xl blur-lg"></div>
          <div className="relative bg-gradient-to-br from-yellow-50 to-amber-50 border-l-8 border-yellow-500 p-8 rounded-2xl shadow-xl hover:shadow-yellow-500/10 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-yellow-800 text-2xl">{stats.pending}</h4>
                <p className="text-yellow-700 font-semibold">Pending Queries</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl blur-lg"></div>
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border-l-8 border-green-500 p-8 rounded-2xl shadow-xl hover:shadow-green-500/10 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-green-800 text-2xl">{stats.resolved}</h4>
                <p className="text-green-700 font-semibold">Resolved Queries</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {}
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
          {recentAnnouncements.length > 0 ? (
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
                    {recentAnnouncements.map((announcement, index) => (
                      <tr
                        key={announcement._id || index}
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
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">
                No recent announcements available
              </p>
            </div>
          )}
        </div>
      </div>
      {}
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
          {recentQueries.length > 0 ? (
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
                    {recentQueries.map((query, index) => (
                      <tr
                        key={query._id || index}
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
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-semibold text-gray-500">
                No recent queries available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};