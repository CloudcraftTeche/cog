// components/queries/QueryCard.tsx
import React from 'react';
import { Clock, Star } from 'lucide-react';
import { getPriorityConfig, getStatusConfig } from '@/utils/student/queryConfig';
import { Query } from '@/types/student/query.types';

interface QueryCardProps {
  query: Query;
  onSelect: (query: Query) => void;
  onAddRating: (queryId: string, rating: number) => void;
}

export const QueryCard: React.FC<QueryCardProps> = ({
  query,
  onSelect,
  onAddRating,
}) => {
  const statusConfig = getStatusConfig(query.status);
  const priorityConfig = getPriorityConfig(query.priority);
  const StatusIcon = statusConfig.icon;

  const showRating = 
    (query.status === 'resolved' || query.status === 'closed') && 
    !query.satisfactionRating;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-purple-100 transform hover:-translate-y-1">
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
              {query.status.replace('_', ' ').toUpperCase()}
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
              {query.responses?.length ?? 0} responses
            </span>
          </div>
        </div>
        <button
          onClick={() => onSelect(query)}
          className="text-purple-600 hover:text-purple-800 font-semibold bg-purple-50 px-6 py-2 rounded-xl hover:bg-purple-100 transition-all"
        >
          View Details
        </button>
      </div>

      {showRating && (
        <div className="mt-6 pt-6 border-t-2 border-purple-100">
          <p className="text-sm text-gray-700 font-semibold mb-3">
            Rate this resolution:
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => onAddRating(query._id, rating)}
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
};