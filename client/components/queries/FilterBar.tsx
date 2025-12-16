import React from 'react';
import { Filter, X } from 'lucide-react';
import { Filters } from '@/types/query.types';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  accentColor?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange,
  accentColor = 'blue'
}) => {
  const hasActiveFilters = filters.status || filters.priority || filters.queryType;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-600 flex items-center justify-center`}>
          <Filter className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({ status: '', priority: '', queryType: '' })}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${accentColor}-500 focus:border-transparent transition-all text-slate-900`}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value })}
            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${accentColor}-500 focus:border-transparent transition-all text-slate-900`}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Type
          </label>
          <select
            value={filters.queryType}
            onChange={(e) => onFilterChange({ ...filters, queryType: e.target.value })}
            className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-${accentColor}-500 focus:border-transparent transition-all text-slate-900`}
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="disciplinary">Disciplinary</option>
            <option value="doctrinal">Doctrinal</option>
            <option value="technical">Technical</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;