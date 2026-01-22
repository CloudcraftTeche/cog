"use client";
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, TrendingUp, Clock, User, ArrowUpCircle, X, Filter, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import type { Query, QueryFilters, QueryStatistics, User as UserType, ApiResponse, PaginatedResponse } from '@/types/admin/query.types';

const TeacherQueryPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [statistics, setStatistics] = useState<QueryStatistics | null>(null);
  const [filters, setFilters] = useState<QueryFilters>({ status: '', priority: '', queryType: '' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [responseContent, setResponseContent] = useState('');
  const [escalationData, setEscalationData] = useState({ to: '', reason: '' });
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [admins, setAdmins] = useState<UserType[]>([]);

  useEffect(() => {
    fetchQueries();
    fetchStatistics();
    fetchAdmins();
  }, [page, filters]);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.queryType && { queryType: filters.queryType })
      });

      const { data } = await api.get(`/queries/received?${params}`);
      
      if (data.success) {
        setQueries(data.data);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const { data } = await api.get<ApiResponse<QueryStatistics>>('/queries/statistics/overview');
      
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get<ApiResponse<UserType[]>>('/admin');
      
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleAddResponse = async (queryId: string) => {
    if (!responseContent.trim()) return;

    try {
      const { data } = await api.post<ApiResponse<Query>>(`/queries/${queryId}/response`, { content: responseContent });
      
      if (data.success) {
        setResponseContent('');
        fetchQueries();
        if (selectedQuery && selectedQuery._id === queryId) {
          const updatedQuery = await fetchQueryDetails(queryId);
          setSelectedQuery(updatedQuery);
        }
      }
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const handleUpdateStatus = async (queryId: string, status: Query['status']) => {
    try {
      const { data } = await api.patch<ApiResponse<Query>>(`/queries/${queryId}/status`, { status });
      
      if (data.success) {
        fetchQueries();
        if (selectedQuery && selectedQuery._id === queryId) {
          const updatedQuery = await fetchQueryDetails(queryId);
          setSelectedQuery(updatedQuery);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

const handleEscalate = async () => {
    if (!escalationData.to || !escalationData.reason || !selectedQuery) return;

    try {
      const { data } = await api.post<ApiResponse<Query>>(`/queries/${selectedQuery._id}/escalate`, {
        to: escalationData.to,
        escalationReason: escalationData.reason
      });
      
      if (data.success) {
        setShowEscalateModal(false);
        setEscalationData({ to: '', reason: '' });
        fetchQueries();
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error('Error escalating query:', error);
    }
  };

  const fetchQueryDetails = async (queryId: string): Promise<Query | null> => {
    const { data } = await api.get<ApiResponse<Query>>(`/queries/${queryId}`);
    return data.success ? data.data : null;
  };

  const getStatusConfig = (status: Query['status']) => {
    const configs = {
      open: { gradient: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50', text: 'text-blue-700' },
      in_progress: { gradient: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50', text: 'text-yellow-700' },
      resolved: { gradient: 'from-green-400 to-emerald-400', bg: 'bg-green-50', text: 'text-green-700' },
      escalated: { gradient: 'from-purple-400 to-pink-400', bg: 'bg-purple-50', text: 'text-purple-700' },
      closed: { gradient: 'from-gray-400 to-slate-400', bg: 'bg-gray-50', text: 'text-gray-700' }
    };
    return configs[status] || configs.open;
  };

  const getPriorityColor = (priority: Query['priority']) => {
    const colors = {
      low: 'from-gray-400 to-gray-500',
      medium: 'from-blue-500 to-indigo-500',
      high: 'from-orange-500 to-red-500',
      urgent: 'from-red-600 to-rose-700'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-teal-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Query Management
          </h1>
          <p className="text-gray-600 text-lg">Review and respond to student queries</p>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 mb-1 font-semibold">Total Queries</p>
                  <p className="text-4xl font-bold">{statistics.total}</p>
                </div>
                <MessageSquare className="w-14 h-14 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 mb-1 font-semibold">Open</p>
                  <p className="text-4xl font-bold">{statistics.byStatus.open}</p>
                </div>
                <Clock className="w-14 h-14 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 mb-1 font-semibold">In Progress</p>
                  <p className="text-4xl font-bold">{statistics.byStatus.inProgress}</p>
                </div>
                <TrendingUp className="w-14 h-14 text-amber-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 mb-1 font-semibold">Avg Rating</p>
                  <p className="text-4xl font-bold">{statistics.averageRating.toFixed(1)} ⭐</p>
                </div>
                <User className="w-14 h-14 text-emerald-200" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-teal-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900">Filter Queries</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
              className="px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as any })}
              className="px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={filters.queryType}
              onChange={(e) => setFilters({ ...filters, queryType: e.target.value as any })}
              className="px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">All Types</option>
              <option value="general">General</option>
              <option value="academic">Academic</option>
              <option value="disciplinary">Disciplinary</option>
              <option value="doctrinal">Doctrinal</option>
              <option value="technical">Technical</option>
            </select>

            <button
              onClick={() => setFilters({ status: '', priority: '', queryType: '' })}
              className="px-4 py-3 border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition-all font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Query List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-200 border-t-teal-600"></div>
              <p className="mt-4 text-gray-600 font-semibold">Loading queries...</p>
            </div>
          ) : queries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-dashed border-teal-200">
              <Sparkles className="w-20 h-20 text-teal-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No queries found</h3>
              <p className="text-gray-600 text-lg">No student queries match your filters</p>
            </div>
          ) : (
            queries.map(query => {
              const statusConfig = getStatusConfig(query.status);
              const priorityGradient = getPriorityColor(query.priority);
              
              return (
                <div key={query._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-teal-100 transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h3 className="text-2xl font-bold text-gray-900">{query.subject}</h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                          {query.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${priorityGradient}`}>
                          {query.priority.toUpperCase()}
                        </span>
                        {query.isSensitive && (
                          <span className="px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Sensitive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-4 text-lg leading-relaxed">{query.content.substring(0, 200)}...</p>
                      <div className="flex items-center gap-6 text-sm flex-wrap">
                        <span className="flex items-center gap-2 bg-teal-50 px-3 py-2 rounded-lg">
                          <User className="w-4 h-4 text-teal-600" />
                          <span className="text-teal-900 font-semibold">{query.from.name} (Roll: {query.from.rollNumber})</span>
                        </span>
                        <span className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-900 font-semibold">{new Date(query.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="bg-purple-50 px-3 py-2 rounded-lg text-purple-900 font-semibold">
                          Type: {query.queryType}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="text-teal-600 hover:text-teal-800 font-bold bg-teal-50 px-6 py-3 rounded-xl hover:bg-teal-100 transition-all whitespace-nowrap"
                    >
                      View & Respond
                    </button>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t-2 border-teal-100 flex-wrap">
                    {query.status === 'open' && (
                      <button
                        onClick={() => handleUpdateStatus(query._id, 'in_progress')}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold shadow-lg transform hover:scale-105"
                      >
                        Start Progress
                      </button>
                    )}
                    {(query.status === 'in_progress' || query.status === 'open') && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(query._id, 'resolved')}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-semibold shadow-lg transform hover:scale-105 flex items-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuery(query);
                            setShowEscalateModal(true);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg transform hover:scale-105 flex items-center gap-2"
                        >
                          <ArrowUpCircle className="w-5 h-5" />
                          Escalate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 border-2 border-teal-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 transition-all font-semibold"
            >
              Previous
            </button>
            <span className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 border-2 border-teal-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 transition-all font-semibold"
            >
              Next
            </button>
          </div>
        )}

        {/* Query Details Modal */}
        {selectedQuery && !showEscalateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{selectedQuery.subject}</h2>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const statusConfig = getStatusConfig(selectedQuery.status);
                        const priorityGradient = getPriorityColor(selectedQuery.priority);
                        return (
                          <>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                              {selectedQuery.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${priorityGradient}`}>
                              {selectedQuery.priority.toUpperCase()}
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
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border-2 border-teal-100">
                    <div className="flex items-center gap-3 mb-4">
                      <User className="w-6 h-6 text-teal-600" />
                      <span className="font-bold text-gray-900 text-lg">
                        {selectedQuery.from.name} (Roll: {selectedQuery.from.rollNumber})
                      </span>
                      <span className="text-sm text-gray-500 ml-auto">
                        {new Date(selectedQuery.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-900 text-lg leading-relaxed">{selectedQuery.content}</p>
                  </div>

                  {selectedQuery.responses && selectedQuery.responses.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Responses</h3>
                      <div className="space-y-4">
                        {selectedQuery.responses.map((response, index) => (
                          <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-bold text-gray-900">{response.from.name}</span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{response.from.role}</span>
                              <span className="text-xs text-gray-500 ml-auto">
                                {new Date(response.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-lg leading-relaxed">{response.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(selectedQuery.status === 'open' || selectedQuery.status === 'in_progress') && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-teal-200">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Add Response</h3>
                      <textarea
                        value={responseContent}
                        onChange={(e) => setResponseContent(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4 transition-all"
                        placeholder="Type your response here..."
                      />
                      <button
                        onClick={() => handleAddResponse(selectedQuery._id)}
                        disabled={!responseContent.trim()}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                      >
                        <Send className="w-5 h-5" />
                        Send Response
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Escalate Modal */}
        {showEscalateModal && selectedQuery && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Escalate Query</h2>
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Escalate To
                    </label>
                    <select
                      value={escalationData.to}
                      onChange={(e) => setEscalationData({ ...escalationData, to: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select admin...</option>
                      {admins.map(admin => (
                        <option key={admin._id} value={admin._id}>
                          {admin.name} - {admin.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Escalation Reason
                    </label>
                    <textarea
                      value={escalationData.reason}
                      onChange={(e) => setEscalationData({ ...escalationData, reason: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Explain why this query needs to be escalated..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleEscalate}
                      disabled={!escalationData.to || !escalationData.reason}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
                    >
                      Escalate Query
                    </button>
                    <button
                      onClick={() => setShowEscalateModal(false)}
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
      </div>
    </div>
  );
};

export default TeacherQueryPage;