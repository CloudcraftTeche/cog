import React from "react";
import { Clock, User, Tag, AlertTriangle, ArrowRight } from "lucide-react";
import { Query } from "@/types/query.types";
import {
  getStatusColor,
  getPriorityColor,
  formatDate,
  formatStatusLabel,
  truncateText,
} from "@/utils/query.utils";
interface QueryCardProps {
  query: Query;
  onSelect: (query: Query) => void;
  onStatusUpdate?: (queryId: string, status: string) => void;
  actions?: React.ReactNode;
  accentColor?: string;
}
const QueryCard: React.FC<QueryCardProps> = ({
  query,
  onSelect,
  onStatusUpdate,
  actions,
  accentColor = "blue",
}) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600`}
      />
      <div className="p-6">
        {}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
              {query.subject}
            </h3>
            {}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(query.status)}`}
              >
                {formatStatusLabel(query.status)}
              </span>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-medium border ${getPriorityColor(query.priority)}`}
              >
                {query.priority.toUpperCase()}
              </span>
              {query.isSensitive && (
                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-700 border border-red-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Sensitive
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onSelect(query)}
            className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all font-medium text-sm`}
          >
            View
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {}
        <p className="text-slate-600 mb-4 line-clamp-2">
          {truncateText(query.content, 200)}
        </p>
        {}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4 text-slate-400" />
            <span className="truncate">
              {query.from.name} ({query.from.rollNumber})
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            {formatDate(query.createdAt)}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Tag className="w-4 h-4 text-slate-400" />
            {query.queryType}
          </div>
          {query.assignedTo && (
            <div className="flex items-center gap-2 text-blue-600 font-medium">
              <User className="w-4 h-4" />
              Assigned: {query.assignedTo.name}
            </div>
          )}
        </div>
        {}
        {query.tags && query.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {query.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        {}
        {actions && (
          <div className="mt-4 pt-4 border-t border-slate-100">{actions}</div>
        )}
      </div>
    </div>
  );
};
export default QueryCard;
