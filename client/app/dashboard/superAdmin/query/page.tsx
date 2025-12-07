"use client";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Eye,
  Trash2,
  Search,
  Download,
  Users,
  Settings,
  Activity,
  Target,
  X,
  Globe,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import api from "@/lib/api";
const SOCKET_URL =process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
const SuperAdminQueryDashboard = () => {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedQueries, setSelectedQueries] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    queryType: "",
    dateRange: "",
    assignedTo: "",
    department: "",
    search: "",
  });
  const [bulkAction, setBulkAction] = useState("");
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    socketInstance.on("connect", () => {
      console.log("Socket connected");
      socketInstance.emit("join-admin-room");
    });
    socketInstance.on("new-query-notification", (data) => {
      console.log("New query received:", data);
      fetchQueries();
    });
    socketInstance.on("query-response-notification", (data) => {
      console.log("Query response received:", data);
      fetchQueries();
    });
    socketInstance.on("query-status-notification", (data) => {
      console.log("Query status updated:", data);
      fetchQueries();
    });
    socketInstance.on("bulk-update-notification", (data) => {
      console.log("Bulk update:", data);
      fetchQueries();
    });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);
  const fetchQueries = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.queryType && { queryType: filters.queryType }),
        ...(filters.search && { search: filters.search }),
      });
      const { data } = await api.get(`/queries/all?${queryParams}`);
      if (data.success) {
        setQueries(data.data.queries);
        setPagination(data.data.pagination);
        const stats = data.data.statistics || {};
        setAnalytics({
          totalQueries: data.data.pagination.total,
          pendingQueries: (stats.open || 0) + (stats.in_progress || 0),
          escalatedQueries: stats.escalated || 0,
          avgResolutionTime: "18.5 hours",
          satisfactionScore: 4.2,
        });
      } else {
        throw new Error("Failed to fetch queries");
      }
      setError(null);
    } catch (err: any) {
      console.error("Error fetching queries:", err);
      setError(err.message || "Failed to load queries");
    } finally {
      setLoading(false);
    }
  };
 const fetchQueryById = async (queryId: string) => {
    try {
      const { data } = await api.get(`/queries/${queryId}`);
      if (data.success) setSelectedQuery(data.data);
    } catch (err) {
      console.error("Error fetching query details:", err);
    }
  };
  useEffect(() => {
    fetchQueries();
  }, [page, filters.status, filters.priority, filters.queryType, filters.search]);
  const handleStatusUpdate = async (queryId: string, status: string, assignedTo?: string) => {
    try {
      const { data } = await api.patch(`/queries/${queryId}/status`, {
        status,
        ...(assignedTo && { assignedTo }),
      });
      if (data.success) {
        socket?.emit("query-status-update", {
          queryId: data.data._id,
          status: data.data.status,
          updatedBy: data.data.resolvedBy,
          subject: data.data.subject,
          notifyUsers: [data.data.from._id, data.data.to._id],
        });
        fetchQueries();
        if (showQueryModal) await fetchQueryById(queryId);
      }
    } catch (err) {
      console.error("Error updating query status:", err);
      alert("Failed to update query status");
    }
  };
  const handleAddResponse = async (queryId: string, content: string, responseType = "reply") => {
    try {
      const { data } = await api.post(`/queries/${queryId}/responses`, {
        content,
        responseType,
        attachments: [],
      });
      if (data.success) {
        socket?.emit("query-response", {
          queryId: data.data._id,
          responseFrom: data.data.responses.at(-1)?.from._id,
          responseContent: content.substring(0, 100),
          subject: data.data.subject,
          notifyUsers: [data.data.from._id, data.data.to._id],
        });
        await fetchQueryById(queryId);
      }
    } catch (err) {
      console.error("Error adding response:", err);
      alert("Failed to add response");
    }
  };
  const handleDeleteQuery = async (queryId: string) => {
    if (!confirm("Are you sure you want to delete this query?")) return;
    try {
      const { data } = await api.delete(`/queries/${queryId}`);
      if (data.success) {
        fetchQueries();
        if (showQueryModal) {
          setShowQueryModal(false);
          setSelectedQuery(null);
        }
      }
    } catch (err) {
      console.error("Error deleting query:", err);
      alert("Failed to delete query");
    }
  };
  const handleBulkAction = async () => {
    if (!bulkAction || selectedQueries.length === 0) return;
    try {
      const promises = selectedQueries.map((queryId) =>
        bulkAction === "delete"
          ? handleDeleteQuery(queryId)
          : handleStatusUpdate(queryId, "closed")
      );
      await Promise.all(promises);
      socket?.emit("bulk-status-update", {
        updatedCount: selectedQueries.length,
        status: bulkAction,
        updatedBy: "admin",
      });
      setShowBulkModal(false);
      setSelectedQueries([]);
      setBulkAction("");
      fetchQueries();
    } catch (err) {
      console.error("Error performing bulk action:", err);
      alert("Failed to perform bulk action");
    }
  };
  const handleViewQuery = async (query: any) => {
    await fetchQueryById(query._id);
    setShowQueryModal(true);
  };
  const handleQuerySelection = (queryId: string) => {
    setSelectedQueries((prev:any) =>
      prev.includes(queryId) ? prev.filter((id:any) => id !== queryId) : [...prev, queryId]
    );
  };
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      escalated: "bg-red-100 text-red-800 border-red-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };
  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    color,
    change,
    subtitle,
  }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              {change > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span
                className={`text-sm font-medium ${
                  change > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
  const QueryRow = ({ query }: any) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <input
            type="checkbox"
            checked={selectedQueries.includes(query._id as never)}
            onChange={() => handleQuerySelection(query._id)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
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
              {query.status === "escalated" && (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
              <div>
                <span className="font-medium">From:</span> {query.from.name}
                <br />
                <span className="text-xs">{query.from.role}</span>
              </div>
              <div>
                <span className="font-medium">Assigned:</span>{" "}
                {query.assignedTo?.name || "Unassigned"}
                <br />
                <span className="text-xs">{query.assignedTo?.role}</span>
              </div>
              <div>
                <span className="font-medium">Type:</span> {query.queryType}
                <br />
                <span className="text-xs">Priority: {query.priority}</span>
              </div>
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(query.createdAt).toLocaleDateString()}
                <br />
                <span className="text-xs">
                  {new Date(query.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <p className="text-gray-700 text-sm line-clamp-2 mb-3">
              {query.content}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-blue-600">
                <MessageCircle size={14} />
                <span className="text-sm">
                  {query.responses?.length || 0} responses
                </span>
              </div>
              {query.tags && query.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {query.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => handleViewQuery(query)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDeleteQuery(query._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
  const QueryModal = () => {
    const [newResponse, setNewResponse] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [selectedAssignee, setSelectedAssignee] = useState("");
    return (
      showQueryModal &&
      selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedQuery?.subject}
                </h2>
                <p className="text-gray-600">Query ID: {selectedQuery._id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                    selectedQuery.status
                  )}`}
                >
                  {selectedQuery.status.replace("_", " ").toUpperCase()}
                </span>
                <button
                  onClick={() => setShowQueryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex h-[70vh]">
              {}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Query Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Priority:</span>{" "}
                        {selectedQuery.priority}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {selectedQuery.queryType}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        {selectedQuery.status}
                      </div>
                      <div>
                        <span className="font-medium">Sensitive:</span>{" "}
                        {selectedQuery.isSensitive ? "Yes" : "No"}
                      </div>
                    </div>
                  </div>
                  {}
                  <div>
                    <h4 className="font-medium mb-2">Original Query</h4>
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {selectedQuery.from.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(selectedQuery.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-800">{selectedQuery.content}</p>
                    </div>
                  </div>
                  {}
                  <div>
                    <h4 className="font-medium mb-3">
                      Response History ({selectedQuery.responses?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {selectedQuery.responses?.map(
                        (response: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">
                                {response.from.name}
                              </span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {response.from.role}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(response.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-800">{response.content}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  {}
                  <div>
                    <h4 className="font-medium mb-2">Add Response</h4>
                    <textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Type your response..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    />
                    <button
                      onClick={() => {
                        if (newResponse.trim()) {
                          handleAddResponse(selectedQuery._id, newResponse);
                          setNewResponse("");
                        }
                      }}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
              {}
              <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {}
                  <div>
                    <h4 className="font-medium mb-3">Assignment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-500" />
                        <span className="text-sm">
                          {selectedQuery.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-500" />
                        <span className="text-sm">
                          {selectedQuery.to?.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  {}
                  <div>
                    <h4 className="font-medium mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <span>
                          Created:{" "}
                          {new Date(selectedQuery.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-gray-500" />
                        <span>
                          Updated:{" "}
                          {new Date(selectedQuery.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedQuery.resolvedAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-500" />
                          <span>
                            Resolved:{" "}
                            {new Date(
                              selectedQuery.resolvedAt
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {}
                  <div>
                    <h4 className="font-medium mb-3">Actions</h4>
                    <div className="space-y-2">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="">Change Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="escalated">Escalated</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        onClick={() => {
                          if (selectedStatus) {
                            handleStatusUpdate(
                              selectedQuery._id,
                              selectedStatus,
                              selectedAssignee || undefined
                            );
                            setSelectedStatus("");
                          }
                        }}
                      >
                        Update Query
                      </button>
                    </div>
                  </div>
                  {}
                  {selectedQuery.tags && selectedQuery.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuery.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    );
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
  if (error && queries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">
            Failed to load queries
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchQueries}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Super Admin Query Management
              </h1>
              <p className="text-gray-600">
                Complete oversight and management of all system queries
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Download size={16} />
                Export All
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Settings size={16} />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Queries"
            value={analytics.totalQueries?.toLocaleString() || "0"}
            icon={MessageCircle}
            color="bg-blue-500"
            change={8.2}
          />
          <MetricCard
            title="Pending Resolution"
            value={analytics.pendingQueries || 0}
            icon={Clock}
            color="bg-yellow-500"
            change={-12.3}
            subtitle="Needs attention"
          />
          <MetricCard
            title="Escalated"
            value={analytics.escalatedQueries || 0}
            icon={AlertTriangle}
            color="bg-red-500"
            change={-5.7}
            subtitle="Critical issues"
          />
          <MetricCard
            title="Avg Resolution Time"
            value={analytics.avgResolutionTime || "N/A"}
            icon={Target}
            color="bg-green-500"
            change={15.4}
            subtitle="Improvement"
          />
        </div>
        {}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <Search
                  size={20}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search queries, users, departments..."
                  className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                />
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
                <option value="escalated">Escalated</option>
                <option value="closed">Closed</option>
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
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filters.queryType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, queryType: e.target.value }))
                }
              >
                <option value="">All Types</option>
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="disciplinary">Disciplinary</option>
                <option value="doctrinal">Doctrinal</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            {selectedQueries.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedQueries.length} selected
                </span>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Settings size={16} />
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>
        {}
        <div className="space-y-4">
          {queries.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-lg text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No queries found</p>
            </div>
          ) : (
            queries.map((query: any) => (
              <QueryRow key={query._id} query={query} />
            ))
          )}
        </div>
        {}
        <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">
            Showing page {pagination.current} of {pagination.pages} (
            {pagination.total} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => (
              <button
                key={i}
                className={`px-3 py-2 rounded-lg ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Bulk Actions
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Action for {selectedQueries.length} queries
                </label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose action...</option>
                  <option value="status_change">Change Status to Closed</option>
                  <option value="delete">Delete Selected</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkAction("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <QueryModal />
    </div>
  );
};
export default SuperAdminQueryDashboard;
