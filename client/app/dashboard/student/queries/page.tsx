"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Send,
  Search,
  Clock,
  Star,
  X,
  Paperclip,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import type {
  Query,
  QueryFilters,
  Recipients,
  CreateQueryData,
  ApiResponse,
} from "@/types/query.types";
const StudentQueryPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [recipients, setRecipients] = useState<Recipients>({
    teachers: [],
    admins: [],
    superAdmins: [],
  });
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<QueryFilters>({
    status: "",
    queryType: "",
    priority: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState<CreateQueryData>({
    to: "",
    subject: "",
    content: "",
    queryType: "general",
    priority: "medium",
    isSensitive: false,
    tags: [],
    attachments: [],
  });
  useEffect(() => {
    fetchQueries();
    fetchRecipients();
  }, [page, filters]);
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.status && { status: filters.status }),
        ...(filters.queryType && { queryType: filters.queryType }),
        ...(filters.priority && { priority: filters.priority }),
      });
      const { data } = await api.get(`/queries/my-queries?${params}`);
      if (data.success) {
        setQueries(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchRecipients = async () => {
    try {
      const { data } = await api.get<ApiResponse<Recipients>>(
        "/queries/recipients"
      );
      if (data.success) {
        setRecipients(data.data);
      }
    } catch (error) {
      console.error("Error fetching recipients:", error);
    }
  };
  const handleCreateQuery = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key as keyof CreateQueryData];
        if (key === "attachments" && Array.isArray(value)) {
          value.forEach((file) => {
            if (file instanceof File)
              formDataToSend.append("attachments", file);
          });
        } else if (key === "tags" && Array.isArray(value)) {
          value.forEach((tag) => {
            formDataToSend.append("tags[]", tag);
          });
        } else {
          formDataToSend.append(key, String(value));
        }
      });
      const { data } = await api.post<ApiResponse<Query>>(
        "/queries",
        formDataToSend
      );
      if (data.success) {
        setShowCreateModal(false);
        fetchQueries();
        resetForm();
      }
    } catch (error) {
      console.error("Error creating query:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddRating = async (queryId: string, rating: number) => {
    try {
      const { data } = await api.post<ApiResponse<Query>>(
        `/queries/${queryId}/rating`,
        { rating }
      );
      if (data.success) {
        fetchQueries();
      }
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };
  const resetForm = () => {
    setFormData({
      to: "",
      subject: "",
      content: "",
      queryType: "general",
      priority: "medium",
      isSensitive: false,
      tags: [],
      attachments: [],
    });
  };
  const getStatusConfig = (status: Query["status"]) => {
    const configs = {
      open: {
        color: "from-blue-500 to-cyan-500",
        text: "text-blue-700",
        bg: "bg-blue-50",
        icon: AlertCircle,
      },
      in_progress: {
        color: "from-yellow-500 to-orange-500",
        text: "text-yellow-700",
        bg: "bg-yellow-50",
        icon: Loader2,
      },
      resolved: {
        color: "from-green-500 to-emerald-500",
        text: "text-green-700",
        bg: "bg-green-50",
        icon: CheckCircle2,
      },
      escalated: {
        color: "from-purple-500 to-pink-500",
        text: "text-purple-700",
        bg: "bg-purple-50",
        icon: AlertCircle,
      },
      closed: {
        color: "from-gray-500 to-slate-500",
        text: "text-gray-700",
        bg: "bg-gray-50",
        icon: CheckCircle2,
      },
    };
    return configs[status] || configs.open;
  };
  const getPriorityConfig = (priority: Query["priority"]) => {
    const configs = {
      low: { color: "bg-gradient-to-r from-gray-400 to-gray-500", text: "Low" },
      medium: {
        color: "bg-gradient-to-r from-blue-400 to-blue-600",
        text: "Medium",
      },
      high: {
        color: "bg-gradient-to-r from-orange-400 to-orange-600",
        text: "High",
      },
      urgent: {
        color: "bg-gradient-to-r from-red-500 to-rose-600",
        text: "Urgent",
      },
    };
    return configs[priority] || configs.medium;
  };
  const filteredQueries = queries?.filter(
    (query) =>
      query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-purple-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                My Queries
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your questions and get answers from faculty
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Query
            </button>
          </div>
        </div>
        {}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search queries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as any })
              }
              className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filters.queryType}
              onChange={(e) =>
                setFilters({ ...filters, queryType: e.target.value as any })
              }
              className="px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="disciplinary">Disciplinary</option>
              <option value="doctrinal">Doctrinal</option>
              <option value="technical">Technical</option>
            </select>
            <button
              onClick={() =>
                setFilters({ status: "", queryType: "", priority: "" })
              }
              className="px-4 py-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </div>
        {}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <p className="mt-4 text-gray-600 font-semibold">
                Loading your queries...
              </p>
            </div>
          ) : filteredQueries?.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-purple-200">
              <Sparkles className="w-20 h-20 text-purple-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No queries found
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Start by creating your first query to get help from faculty
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Create Your First Query
              </button>
            </div>
          ) : (
            filteredQueries?.map((query) => {
              const statusConfig = getStatusConfig(query.status);
              const priorityConfig = getPriorityConfig(query.priority);
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={query._id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-purple-100 transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {query.subject}
                        </h3>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-2`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {query.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${priorityConfig.color}`}
                        >
                          {priorityConfig.text}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-4 text-lg leading-relaxed">
                        {query.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-900">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </span>
                        </span>
                        <span className="bg-indigo-50 px-3 py-1 rounded-lg text-indigo-900">
                          To: {query.to.name} ({query.to.role})
                        </span>
                        <span className="bg-pink-50 px-3 py-1 rounded-lg text-pink-900">
                          {query.responses.length} responses
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="text-purple-600 hover:text-purple-800 font-semibold bg-purple-50 px-6 py-2 rounded-xl hover:bg-purple-100 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                  {(query.status === "resolved" || query.status === "closed") &&
                    !query.satisfactionRating && (
                      <div className="mt-6 pt-6 border-t-2 border-purple-100">
                        <p className="text-sm text-gray-700 font-semibold mb-3">
                          Rate this resolution:
                        </p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5]?.map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleAddRating(query._id, rating)}
                              className="flex-1 px-4 py-3 border-2 border-yellow-300 rounded-xl hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:text-white hover:border-transparent transition-all transform hover:scale-105"
                            >
                              {rating} ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  {query.satisfactionRating && (
                    <div className="mt-6 pt-6 border-t-2 border-purple-100">
                      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-3 rounded-xl">
                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                        <span className="font-semibold text-yellow-900">
                          Your rating: {query.satisfactionRating} ⭐
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 border-2 border-purple-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-all font-semibold"
            >
              Previous
            </button>
            <span className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 border-2 border-purple-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 transition-all font-semibold"
            >
              Next
            </button>
          </div>
        )}
        {}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Create New Query
                  </h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Send To
                    </label>
                    <select
                      value={formData.to}
                      onChange={(e) =>
                        setFormData({ ...formData, to: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select recipient...</option>
                      {recipients.teachers.length > 0 && (
                        <optgroup label="Teachers">
                          {recipients.teachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name} - {teacher.email}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {recipients.admins.length > 0 && (
                        <optgroup label="Admins">
                          {recipients.admins.map((admin) => (
                            <option key={admin._id} value={admin._id}>
                              {admin.name} - Admin
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {recipients.superAdmins.length > 0 && (
                        <optgroup label="Super Admins">
                          {recipients.superAdmins.map((sa) => (
                            <option key={sa._id} value={sa._id}>
                              {sa.name} - Super Admin
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      maxLength={200}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Brief summary of your query"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Describe your query in detail..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Query Type
                      </label>
                      <select
                        value={formData.queryType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            queryType: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="general">General</option>
                        <option value="academic">Academic</option>
                        <option value="disciplinary">Disciplinary</option>
                        <option value="doctrinal">Doctrinal</option>
                        <option value="technical">Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer bg-purple-50 p-4 rounded-xl hover:bg-purple-100 transition-all">
                      <input
                        type="checkbox"
                        checked={formData.isSensitive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isSensitive: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Mark as sensitive
                      </span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attachments: Array.from(e.target.files || []),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      <Paperclip className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateQuery}
                      disabled={
                        loading ||
                        !formData.to ||
                        !formData.subject ||
                        !formData.content
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 font-semibold shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                      {loading ? "Sending..." : "Send Query"}
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-8 py-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {}
        {selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {selectedQuery.subject}
                    </h2>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const statusConfig = getStatusConfig(
                          selectedQuery.status
                        );
                        const priorityConfig = getPriorityConfig(
                          selectedQuery.priority
                        );
                        const StatusIcon = statusConfig.icon;
                        return (
                          <>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-2`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {selectedQuery.status
                                .replace("_", " ")
                                .toUpperCase()}
                            </span>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${priorityConfig.color}`}
                            >
                              {priorityConfig.text}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedQuery(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
                    <p className="text-gray-900 text-lg leading-relaxed">
                      {selectedQuery.content}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-semibold">
                        To: {selectedQuery.to.name} ({selectedQuery.to.role})
                      </span>
                      <span className="text-gray-500">
                        {new Date(selectedQuery.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {selectedQuery.responses &&
                    selectedQuery.responses.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Responses
                        </h3>
                        <div className="space-y-4">
                          {selectedQuery.responses.map((response, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="font-bold text-gray-900">
                                      {response.from.name}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                      {response.from.role}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        response.createdAt
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-lg leading-relaxed">
                                    {response.content}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentQueryPage;
