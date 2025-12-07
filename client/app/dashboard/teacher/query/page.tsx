"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Clock, Search } from "lucide-react";
import { io } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import QueryModal from "@/components/teacher/query/QueryModal";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_SERVERURL || "";

const TeacherDashboard = () => {
  const { isLoading: authLoading, user } = useAuth();

  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState<any>(false);
  const [responseText, setResponseText] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/queries/teacher");
        if (!mounted) return;
        const qs = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setQueries(qs);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load queries");
      } finally {
        setLoading(false);
      }
    };
    load();

    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    if (user?.id) {
      socket.emit("join-user-room", user.id);
    }

    socket.on("query:created", (q) => setQueries((prev) => [q, ...prev]));
    socket.on("query:updated", (q) =>
      setQueries((prev) => prev.map((p) => (p._id === q._id ? q : p)))
    );
    socket.on("response:created", ({ queryId, response }) => {
      setQueries((prev) =>
        prev.map((p) =>
          p._id === queryId
            ? { ...p, responses: [...(p.responses || []), response] }
            : p
        )
      );
    });

    socket.on("new-query-notification", (data) => {
      toast.info(`New query from ${data.from?.name}: ${data.subject}`);
    });

    socket.on("query-response-notification", (data) => {
      toast.info(`New response on: ${data.subject}`);
    });

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [authLoading, user]);

  const handleViewQuery = (query: any) => {
    setSelectedQuery(query);
    setShowQueryModal(true);
    setResponseText("");
  };

  const handleSendResponse = async () => {
    if (!responseText.trim() || !selectedQuery?._id) {
      toast.error("Please enter a response");
      return;
    }

    try {
      const { data } = await api.post(
        `/queries/${selectedQuery._id}/responses`,
        {
          content: responseText,
          from: "teacher",
        }
      );

      const newResponse = data?.response || {
        from: { role: "teacher", name: user?.name || "You" },
        content: responseText,
        createdAt: new Date().toISOString(),
      };

      setQueries((prev) =>
        prev.map((q) =>
          q._id === selectedQuery._id
            ? {
                ...q,
                responses: [...(q.responses || []), newResponse],
                status: q.status === "open" ? "in_progress" : q.status,
              }
            : q
        )
      );
      setSelectedQuery((prev: any) =>
        prev
          ? {
              ...prev,
              responses: [...(prev.responses || []), newResponse],
              status: prev.status === "open" ? "in_progress" : prev.status,
            }
          : prev
      );
      setResponseText("");
      toast.success("Response sent successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to send response");
    }
  };

  const handleStatusChange = async (queryId: any, newStatus: any) => {
    try {
      await api.patch(`/queries/${queryId}/status`, { status: newStatus });
      setQueries((prev) =>
        prev.map((q) => (q._id === queryId ? { ...q, status: newStatus } : q))
      );
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery((prev: any) =>
          prev ? { ...prev, status: newStatus } : prev
        );
      }
      toast.success(`Query status updated to ${newStatus.replace("_", " ")}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status: any) => {
    const colors: any = {
      open: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      escalated: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: any) => {
    const colors: any = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getTimeAgo = (date: any) => {
    const now = new Date().getTime();
    const diff = now - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const QueryCard = ({ query }: any) => (
    <div
      onClick={() => handleViewQuery(query)}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {query.from?.name?.charAt(0) || "?"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {query.subject}
            </h3>
            <p className="text-sm text-gray-600">
              {query.from?.name || "Unknown"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              query.status
            )}`}
          >
            {query.status.replace("_", " ").toUpperCase()}
          </span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
              query.priority
            )}`}
          >
            {query.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{query.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <MessageCircle size={14} />
            {query.responses?.length || 0} responses
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {getTimeAgo(query.createdAt)}
          </span>
        </div>
        <span className="capitalize">{query.queryType}</span>
      </div>
    </div>
  );

  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
      query.from?.name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || query.status === filters.status;
    const matchesPriority =
      !filters.priority || query.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statistics = {
    pending: queries.filter((q) => q.status === "open").length,
    responded: queries.filter((q) => (q.responses?.length || 0) > 0).length,
    resolved: queries.filter((q) => q.status === "resolved").length,
    avgResponseTime: queries.length > 0 ? "2.4 hrs" : "—",
  };

  if (loading && queries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600">
                Manage student queries and communications
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {statistics.pending}
                </div>
                <MessageCircle size={24} className="text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search queries or students..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
              </div>
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredQueries.map((query) => (
            <QueryCard key={query._id} query={query} />
          ))}
        </div>

        {filteredQueries.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No queries found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </div>

      <QueryModal
        key={selectedQuery?._id}
        show={showQueryModal}
        onClose={() => setShowQueryModal(false)}
        query={selectedQuery}
        onStatusChange={handleStatusChange}
        onResponseSent={handleSendResponse}
        user={user}
      />
    </div>
  );
};

export default TeacherDashboard;
