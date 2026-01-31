"use client";
import React, { useState, useMemo } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useQueriesList, useRecipients, useCreateQuery, useAddRating } from "@/hooks/student/useQueries";
import { QueryCard } from "@/components/student/queries/QueryCard";
import { QueryFiltersBar } from "@/components/student/queries/QueryFilters";
import { CreateQueryModal } from "@/components/student/queries/CreateQueryModal";
import { QueryDetailModal } from "@/components/student/queries/QueryDetailModal";
import { CreateQueryData, Query, QueryFilters } from "@/types/student/query.types";

const INITIAL_FORM_DATA: CreateQueryData = {
  to: "",
  subject: "",
  content: "",
  queryType: "general",
  priority: "medium",
  isSensitive: false,
  tags: [],
  attachments: [],
};

const StudentQueryPage: React.FC = () => {
  const [filters, setFilters] = useState<QueryFilters>({
    status: "",
    queryType: "",
    priority: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateQueryData>(INITIAL_FORM_DATA);

  // Queries
  const { data: queriesData, isLoading: isLoadingQueries } = useQueriesList({
    page,
    limit: 10,
    status: filters.status || undefined,
    queryType: filters.queryType || undefined,
    priority: filters.priority || undefined,
  });

  const { data: recipients } = useRecipients();
  const createMutation = useCreateQuery();
  const ratingMutation = useAddRating();

  // Derived state
  const queries = queriesData?.queries ?? [];
  const totalPages = queriesData?.totalPages ?? 1;

  const filteredQueries = useMemo(() => {
    if (!searchTerm) return queries;
    
    const searchLower = searchTerm.toLowerCase();
    return queries.filter(
      (query) =>
        query.subject.toLowerCase().includes(searchLower) ||
        query.content.toLowerCase().includes(searchLower)
    );
  }, [queries, searchTerm]);

  // Handlers
  const handleCreateQuery = async () => {
    await createMutation.mutateAsync(formData);
    setShowCreateModal(false);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleAddRating = async (queryId: string, rating: number) => {
    await ratingMutation.mutateAsync({ queryId, rating });
  };

  const handleClearFilters = () => {
    setFilters({ status: "", queryType: "", priority: "" });
    setSearchTerm("");
  };

  const handleFormChange = (data: Partial<CreateQueryData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Filters */}
        <QueryFiltersBar
          filters={filters}
          searchTerm={searchTerm}
          onFiltersChange={setFilters}
          onSearchChange={setSearchTerm}
          onClearFilters={handleClearFilters}
        />

        {/* Queries List */}
        <div className="space-y-6">
          {isLoadingQueries ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
              <p className="mt-4 text-gray-600 font-semibold">
                Loading your queries...
              </p>
            </div>
          ) : filteredQueries.length === 0 ? (
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
            filteredQueries.map((query) => (
              <QueryCard
                key={query._id}
                query={query}
                onSelect={setSelectedQuery}
                onAddRating={handleAddRating}
              />
            ))
          )}
        </div>

        {/* Pagination */}
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

        {/* Modals */}
        <CreateQueryModal
          isOpen={showCreateModal}
          formData={formData}
          recipients={recipients ?? null}
          isLoading={createMutation.isPending}
          onClose={() => setShowCreateModal(false)}
          onFormChange={handleFormChange}
          onSubmit={handleCreateQuery}
        />

        <QueryDetailModal
          query={selectedQuery}
          onClose={() => setSelectedQuery(null)}
        />
      </div>
    </div>
  );
};

export default StudentQueryPage;