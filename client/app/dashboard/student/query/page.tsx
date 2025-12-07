"use client";
import { useState, useEffect } from "react";
import { MessageCircle, Clock, CheckCircle, Plus, Search, User, Edit3 } from "lucide-react";
import { io } from "socket.io-client";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import CreateQueryModal from "@/components/admin/query/CreateQueryModal";
import QueryModal from "@/components/student/QueryModal";
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_SERVERURL || "";
const StudentDashboard = () => {
  const { isLoading: authLoading, user } = useAuth();
  const [queries, setQueries] = useState<any[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState<any>(false);
  const [showCreateModal, setShowCreateModal] = useState<any>(false);
  const [responseText, setResponseText] = useState("");
  const [newQuery, setNewQuery] = useState<any>({
    to: "",
    subject: "",
    content: "",
    queryType: "general",
    priority: "medium",
    attachments: [],
  });
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  useEffect(() => {
    if (authLoading) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [qRes, tRes] = await Promise.all([
          api.get("/queries/student"),
          api.get("/queries/teachers"),
        ]);
        if (!mounted) return;
        const qData = Array.isArray(qRes.data)
          ? qRes.data
          : qRes.data?.items || [];
        const tData = Array.isArray(tRes.data)
          ? tRes.data
          : tRes.data?.items || [];
        setQueries(qData);
        setTeachers(tData);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load data");
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
      toast.success(`New query created: ${data.subject}`);
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
  const handleCreateQuery = async () => {
    if (!newQuery.to || !newQuery.subject || !newQuery.content) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const teacher: any = teachers.find(
        (t: any) => t._id === newQuery.to || t.id === newQuery.to
      );
      const payload = {
        to: teacher?._id || teacher?.id || newQuery.to,
        subject: newQuery.subject,
        content: newQuery.content,
        queryType: newQuery.queryType,
        priority: newQuery.priority,
        attachments: newQuery.attachments || [],
      };
      const { data } = await api.post("/queries", payload);
      setQueries((prev) => [data, ...prev]);
      setShowCreateModal(false);
      setNewQuery({
        to: "",
        subject: "",
        content: "",
        queryType: "general",
        priority: "medium",
        attachments: [],
      });
      toast.success("Query created successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create query");
    }
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
          from: "student",
        }
      );
      const newResponse = data?.response || {
        from: { role: "student", name: user?.name || "You" },
        content: responseText,
        createdAt: new Date().toISOString(),
      };
      setQueries((prev) =>
        prev.map((q) =>
          q._id === selectedQuery._id
            ? { ...q, responses: [...(q.responses || []), newResponse] }
            : q
        )
      );
      setSelectedQuery((prev: any) =>
        prev
          ? { ...prev, responses: [...(prev.responses || []), newResponse] }
          : prev
      );
      setResponseText("");
      toast.success("Response sent successfully!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to send response");
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
    const now: any = new Date();
    const diff = now - (new Date(date) as any);
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
      className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
            {query.subject}
          </h3>
          <div className="flex items-center gap-2 mb-2">
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
          <p className="text-sm text-gray-600 mb-3">
            To: {query.to?.name || "—"}{" "}
            {query.to?.subject ? `• ${query.to.subject}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(query.responses || []).length > 0 && (
            <div className="flex items-center gap-1 text-green-600">
              <MessageCircle size={16} />
              <span className="text-sm font-medium">
                {(query.responses || []).length}
              </span>
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{query.content}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {getTimeAgo(query.createdAt)}
          </span>
          <span className="capitalize">{query.queryType}</span>
        </div>
        {query.status === "resolved" && (
          <CheckCircle size={16} className="text-green-500" />
        )}
      </div>
    </div>
  );
  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.subject?.toLowerCase().includes(filters.search.toLowerCase()) ||
      query.to?.name?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || query.status === filters.status;
    const matchesPriority =
      !filters.priority || query.priority === filters.priority;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  const statistics = {
    total: queries.length,
    pending: queries.filter((q) => q.status === "open").length,
    inProgress: queries.filter((q) => q.status === "in_progress").length,
    resolved: queries.filter((q) => q.status === "resolved").length,
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
              <h1 className="text-2xl font-bold text-gray-900">My Queries</h1>
              <p className="text-gray-600">
                Track your questions and get help from teachers
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              New Query
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Queries"
            value={statistics.total}
            icon={MessageCircle}
            color="bg-blue-500"
            subtitle="All time"
          />
          <StatCard
            title="Pending"
            value={statistics.pending}
            icon={Clock}
            color="bg-yellow-500"
            subtitle="Awaiting response"
          />
          <StatCard
            title="In Progress"
            value={statistics.inProgress}
            icon={Edit3}
            color="bg-purple-500"
            subtitle="Being addressed"
          />
          <StatCard
            title="Resolved"
            value={statistics.resolved}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Completed"
          />
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Need Help?</h3>
              <p className="opacity-90">
                Ask your teachers questions and get personalized assistance
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Ask a Question
            </button>
          </div>
        </div>
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
                  placeholder="Search your queries..."
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
              {queries.length === 0 ? "No queries yet" : "No queries found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {queries.length === 0
                ? "Start by asking your first question to get help from your teachers."
                : "Try adjusting your filters to find what you're looking for."}
            </p>
            {queries.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Create Your First Query
              </button>
            )}
          </div>
        )}
        {queries.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Teachers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher: any) => (
                <div
                  key={teacher._id || teacher.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {teacher.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {teacher.subject || "Teacher"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNewQuery((prev: any) => ({
                        ...prev,
                        to: teacher._id || teacher.id,
                      }));
                      setShowCreateModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <MessageCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <CreateQueryModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        teachers={teachers}
        newQuery={newQuery}
        setNewQuery={setNewQuery}
        handleCreateQuery={handleCreateQuery}
      />
      <QueryModal
        show={showQueryModal}
        query={selectedQuery}
        onClose={() => setShowQueryModal(false)}
        onSendResponse={handleSendResponse}
        responseText={responseText}
        setResponseText={setResponseText}
        getStatusColor={getStatusColor}
        getPriorityColor={getPriorityColor}
      />
    </div>
  );
};
export default StudentDashboard;
