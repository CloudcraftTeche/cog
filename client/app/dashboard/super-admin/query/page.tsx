"use client";;
import { useState, useEffect } from "react";
import { MessageCircle, Clock, AlertTriangle, TrendingUp, Eye, Search, Timer } from "lucide-react";
import { io } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import AdminQueryModal from "@/components/admin/query/AdminQueryModal";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_SERVERURL || "";
const SuperAdminQueryDashboard = () => {
  const { isLoading: authLoading, user } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [myQueries, setMyQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState<any>(false);
  const [activeTab, setActiveTab] = useState("assigned");
  const [responseText, setResponseText] = useState<any>("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    queryType: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    assigned: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    avgResolutionTime: "—",
    departmentTotal: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);
  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [myRes, deptRes] = await Promise.all([
          api.get("/queries/admin/my"),
          api.get("/queries/admin/department"),
        ]);
        if (!mounted) return;
        const my = Array.isArray(myRes.data)
          ? myRes.data
          : myRes.data?.items || [];
        const dept = Array.isArray(deptRes.data)
          ? deptRes.data
          : deptRes.data?.items || [];
        setMyQueries(my);
        setQueries([...my, ...dept]);
        const assigned = my.length;
        const pending = my.filter((q: any) => q.status === "open").length;
        const completed = my.filter((q: any) => q.status === "resolved").length;
        const overdue = my.filter(isOverdue).length;
        const departmentTotal = dept.length;
        setStatistics({
          assigned,
          pending,
          completed,
          overdue,
          avgResolutionTime: "2.5 hrs",
          departmentTotal,
        });
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const weekly = days.map((day, i) => ({
          day,
          resolved: Math.floor(Math.random() * 5) + 1,
          received: Math.floor(Math.random() * 6) + 1,
        }));
        setWeeklyData(weekly);
        const types: any = {};
        my.forEach((q: any) => {
          types[q.queryType] = (types[q.queryType] || 0) + 1;
        });
        const typeData = Object.entries(types).map(([name, value], i) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"][i] || "#9ca3af",
        }));
        setTypeDistribution(typeData);
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
    socket.on("query:updated", (q) => {
      setQueries((prev) => prev.map((p) => (p._id === q._id ? q : p)));
      setMyQueries((prev) => prev.map((p) => (p._id === q._id ? q : p)));
    });
    socket.on("response:created", ({ queryId, response }) => {
      setQueries((prev) =>
        prev.map((p) =>
          p._id === queryId
            ? { ...p, responses: [...(p.responses || []), response] }
            : p
        )
      );
      setMyQueries((prev) =>
        prev.map((p) =>
          p._id === queryId
            ? { ...p, responses: [...(p.responses || []), response] }
            : p
        )
      );
    });
    socket.on("new-query-notification", (data) => {
      toast.info(`New query: ${data.subject}`);
    });
    socket.on("query-assigned", (data) => {
      toast.success(`Query assigned: ${data.subject}`);
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
          from: { role: "admin" },
        }
      );
      const newResponse = data?.response || {
        from: { role: "admin", name: user?.name || "Admin" },
        content: responseText,
        createdAt: new Date().toISOString(),
      };
      const updatedQuery = {
        ...selectedQuery,
        responses: [...(selectedQuery.responses || []), newResponse],
        status:
          selectedQuery.status === "open"
            ? "in_progress"
            : selectedQuery.status,
        lastActivity: new Date().toISOString(),
      };
      setMyQueries((prev) =>
        prev.map((q) => (q._id === selectedQuery._id ? updatedQuery : q))
      );
      setQueries((prev) =>
        prev.map((q) => (q._id === selectedQuery._id ? updatedQuery : q))
      );
      setSelectedQuery(updatedQuery);
      setResponseText("");
      toast.success("Response sent successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to send response");
    }
  };
  const handleStatusChange = async (queryId: any, newStatus: any) => {
    try {
      await api.patch(`/queries/${queryId}/status`, { status: newStatus });
      const updatedQuery = {
        status: newStatus,
        resolvedAt: newStatus === "resolved" ? new Date().toISOString() : null,
        lastActivity: new Date().toISOString(),
      };
      setMyQueries((prev) =>
        prev.map((q) => (q._id === queryId ? { ...q, ...updatedQuery } : q))
      );
      setQueries((prev) =>
        prev.map((q) => (q._id === queryId ? { ...q, ...updatedQuery } : q))
      );
      if (selectedQuery && selectedQuery._id === queryId) {
        setSelectedQuery((prev: any) =>
          prev ? { ...prev, ...updatedQuery } : prev
        );
      }
      toast.success(`Query status updated to ${newStatus.replace("_", " ")}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    }
  };
  const assignToMe = async (queryId: any) => {
    try {
      const { data } = await api.post(`/queries/${queryId}/assign`);
      setQueries((prev) => prev.map((q) => (q._id === queryId ? data : q)));
      setMyQueries((prev) => {
        const exists = prev.some((q) => q._id === queryId);
        return exists
          ? prev.map((q) => (q._id === queryId ? data : q))
          : [data, ...prev];
      });
      toast.success("Query assigned to you!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to assign query");
    }
  };
  const getStatusColor = (status: any) => {
    const colors: any = {
      open: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      escalated: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
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
  const isOverdue = (query: any) => {
    if (query.status === "resolved") return false;
    const now = new Date().getTime();
    const created = new Date(query.createdAt).getTime();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    const slaHours: any = {
      urgent: 4,
      high: 8,
      medium: 24,
      low: 48,
    };
    return hoursDiff > (slaHours[query.priority] || 24);
  };
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    subtitle,
    onClick,
  }: any) => (
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last week</span>
            </div>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
  const QueryCard = ({ query, showAssignButton = false }: any) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {query.subject}
            </h3>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
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
            {isOverdue(query) && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <span>{query.from?.name || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{getTimeAgo(query.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>{query.responses?.length || 0} responses</span>
            </div>
            {isOverdue(query) && (
              <div className="flex items-center gap-1">
                <Timer size={14} />
                <span className="text-red-600">Overdue</span>
              </div>
            )}
          </div>
          <p className="text-gray-700 text-sm line-clamp-2 mb-3">
            {query.content}
          </p>
          <div className="flex items-center gap-2">
            {query.tags?.map((tag: any) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {showAssignButton && !query.assignedTo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                assignToMe(query._id);
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Assign to Me
            </button>
          )}
          <button
            onClick={() => handleViewQuery(query)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
  const filteredQueries = (
    activeTab === "assigned" ? myQueries : queries
  ).filter((query) => {
    const matchesSearch =
      query.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
      query.from?.name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || query.status === filters.status;
    const matchesPriority =
      !filters.priority || query.priority === filters.priority;
    const matchesType =
      !filters.queryType || query.queryType === filters.queryType;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });
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
                Pastor Query Dashboard
              </h1>
              <p className="text-gray-600">
                Manage and respond to queries in your department
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("assigned")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "assigned"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                My Assigned Queries ({myQueries.length})
              </button>
              <button
                onClick={() => setActiveTab("department")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "department"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Department Queue ({queries.length - myQueries.length})
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overdue"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overdue ({myQueries.filter((q) => isOverdue(q)).length})
              </button>
            </nav>
          </div>
          <div className="p-6 border-b">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search queries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
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
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.queryType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, queryType: e.target.value }))
                }
              >
                <option value="">All Types</option>
                <option value="technical">Technical</option>
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="disciplinary">Disciplinary</option>
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {filteredQueries.map((query) => (
            <QueryCard
              key={query._id}
              query={query}
              showAssignButton={activeTab === "department"}
            />
          ))}
        </div>
        {filteredQueries.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No queries found
            </h3>
            <p className="text-gray-600">
              {activeTab === "assigned"
                ? "Great job! You have no pending queries assigned to you."
                : "No queries match your current filters."}
            </p>
          </div>
        )}
        {filteredQueries.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredQueries.filter((q) => q.status === "open").length}
              </div>
              <div className="text-sm text-gray-600">Open Queries</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  filteredQueries.filter((q) => q.status === "in_progress")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredQueries.filter((q) => isOverdue(q)).length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        )}
      </div>
      <AdminQueryModal
        show={showQueryModal}
        query={selectedQuery}
        onClose={() => setShowQueryModal(false)}
        responseText={responseText}
        setResponseText={setResponseText}
        handleSendResponse={handleSendResponse}
        handleStatusChange={handleStatusChange}
        getPriorityColor={getPriorityColor}
      />
    </div>
  );
};
export default SuperAdminQueryDashboard;
