// components/queries/QueryFilters.tsx
import React from 'react';
import { Search } from 'lucide-react';
import { QueryFilters } from '@/types/student/query.types';

interface QueryFiltersProps {
  filters: QueryFilters;
  searchTerm: string;
  onFiltersChange: (filters: QueryFilters) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
}

export const QueryFiltersBar: React.FC<QueryFiltersProps> = ({
  filters,
  searchTerm,
  onFiltersChange,
  onSearchChange,
  onClearFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({ ...filters, status: e.target.value as any })
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
            onFiltersChange({ ...filters, queryType: e.target.value as any })
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
          onClick={onClearFilters}
          className="px-4 py-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all font-semibold"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};