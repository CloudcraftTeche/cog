"use client";
import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  UserPlus,
  ArrowUpCircle,
  CheckCircle,
} from "lucide-react";
import api from "@/lib/api";
import { Query, Statistics, Filters, User } from "@/types/query.types";
import StatCard from "@/components/queries/StatCard";
import FilterBar from "@/components/queries/FilterBar";
import QueryCard from "@/components/queries/QueryCard";
import QueryDetailModal from "@/components/queries/QueryDetailModal";
import AssignModal from "@/components/queries/AssignModal";
import EscalateModal from "@/components/queries/EscalateModal";
const AdminQueryPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
    queryType: "",
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);
  useEffect(() => {
    fetchQueries();
    fetchStatistics();
    fetchTeachers();
    fetchSuperAdmins();
  }, [page, filters]);
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.queryType && { queryType: filters.queryType }),
      });
      const response = await api.get(`/queries/received?${params}`);
      if (response.data.success) {
        setQueries(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching queries:", error);
    } finally {
      setLoading(false);
    }
  };
  const fetchStatistics = async () => {
    try {
      const response = await api.get("/queries/statistics/overview");
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };
  const fetchTeachers = async () => {
    try {
      const response = await api.get("/teachers");
      if (response.data.success) {
        setTeachers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };
  const fetchSuperAdmins = async () => {
    try {
      const response = await api.get("/superadmins");
      if (response.data.success) {
        setSuperAdmins(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching super admins:", error);
    }
  };
  const handleAddResponse = async (queryId: string, content: string) => {
    try {
      const response = await api.post(`/queries/${queryId}/response`, {
        content,
      });
      if (response.data.success) {
        await fetchQueries();
        if (selectedQuery && selectedQuery._id === queryId) {
          const updatedQuery = await fetchQueryDetails(queryId);
          setSelectedQuery(updatedQuery);
        }
      }
    } catch (error) {
      console.error("Error adding response:", error);
      throw error;
    }
  };
  const handleUpdateStatus = async (queryId: string, status: string) => {
    try {
      const response = await api.patch(`/queries/${queryId}/status`, {
        status,
      });
      if (response.data.success) {
        await fetchQueries();
        if (selectedQuery && selectedQuery._id === queryId) {
          const updatedQuery = await fetchQueryDetails(queryId);
          setSelectedQuery(updatedQuery);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const handleAssignQuery = async (userId: string) => {
    if (!selectedQuery) return;
    try {
      const response = await api.patch(`/queries/${selectedQuery._id}/assign`, {
        assignedTo: userId,
      });
      if (response.data.success) {
        await fetchQueries();
        const updatedQuery = await fetchQueryDetails(selectedQuery._id);
        setSelectedQuery(updatedQuery);
      }
    } catch (error) {
      console.error("Error assigning query:", error);
      throw error;
    }
  };
  const handleEscalate = async (to: string, reason: string) => {
    if (!selectedQuery) return;
    try {
      const response = await api.post(
        `/queries/${selectedQuery._id}/escalate`,
        {
          to,
          reason,
        }
      );
      if (response.data.success) {
        await fetchQueries();
        setSelectedQuery(null);
      }
    } catch (error) {
      console.error("Error escalating query:", error);
      throw error;
    }
  };
  const fetchQueryDetails = async (queryId: string): Promise<Query | null> => {
    try {
      const response = await api.get(`/queries/${queryId}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error("Error fetching query details:", error);
      return null;
    }
  };
  const renderQueryActions = (query: Query) => (
    <div className="flex flex-wrap gap-2">
      {query.status === "open" && (
        <button
          onClick={() => handleUpdateStatus(query._id, "in_progress")}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium"
        >
          <TrendingUp className="w-4 h-4" />
          Start Progress
        </button>
      )}
      {(query.status === "in_progress" || query.status === "open") && (
        <>
          <button
            onClick={() => handleUpdateStatus(query._id, "resolved")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Resolved
          </button>
          <button
            onClick={() => {
              setSelectedQuery(query);
              setShowAssignModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Assign
          </button>
          <button
            onClick={() => {
              setSelectedQuery(query);
              setShowEscalateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all text-sm font-medium"
          >
            <ArrowUpCircle className="w-4 h-4" />
            Escalate
          </button>
        </>
      )}
    </div>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Query Dashboard</h1>
              <p className="text-blue-100 text-lg">
                Manage and oversee all student queries
              </p>
            </div>
          </div>
        </div>
        {}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <StatCard
              title="Total Queries"
              value={statistics.total}
              icon={MessageSquare}
              color="text-blue-600"
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Open"
              value={statistics.byStatus.open}
              icon={Clock}
              color="text-blue-600"
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              title="In Progress"
              value={statistics.byStatus.inProgress}
              icon={TrendingUp}
              color="text-amber-600"
              gradient="from-amber-500 to-amber-600"
            />
            <StatCard
              title="Resolved"
              value={statistics.byStatus.resolved}
              icon={Users}
              color="text-emerald-600"
              gradient="from-emerald-500 to-emerald-600"
            />
            <StatCard
              title="Avg Rating"
              value={`${statistics.averageRating.toFixed(1)} ⭐`}
              icon={BarChart3}
              color="text-purple-600"
              gradient="from-purple-500 to-purple-600"
            />
          </div>
        )}
        {}
        <div className="mb-8">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            accentColor="blue"
          />
        </div>
        {}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            </div>
          ) : queries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
              <MessageSquare className="w-20 h-20 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No queries found
              </h3>
              <p className="text-slate-600">
                No queries match your current filters
              </p>
            </div>
          ) : (
            queries.map((query) => (
              <QueryCard
                key={query._id}
                query={query}
                onSelect={setSelectedQuery}
                actions={renderQueryActions(query)}
                accentColor="blue"
              />
            ))
          )}
        </div>
        {}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Previous
            </button>
            <span className="px-6 py-3 bg-white rounded-xl border-2 border-slate-200 font-semibold text-slate-900">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Next
            </button>
          </div>
        )}
        {}
        {selectedQuery && !showAssignModal && !showEscalateModal && (
          <QueryDetailModal
            query={selectedQuery}
            onClose={() => setSelectedQuery(null)}
            onAddResponse={handleAddResponse}
            accentColor="blue"
          />
        )}
        {showAssignModal && selectedQuery && (
          <AssignModal
            query={selectedQuery}
            teachers={teachers}
            onClose={() => setShowAssignModal(false)}
            onAssign={handleAssignQuery}
            accentColor="blue"
          />
        )}
        {showEscalateModal && selectedQuery && (
          <EscalateModal
            query={selectedQuery}
            superAdmins={superAdmins}
            onClose={() => setShowEscalateModal(false)}
            onEscalate={handleEscalate}
          />
        )}
      </div>
    </div>
  );
};
export default AdminQueryPage;
