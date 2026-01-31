// components/queries/QueryDetailModal.tsx
import React from 'react';
import { X } from 'lucide-react';
import { getStatusConfig, getPriorityConfig } from '@/utils/student/queryConfig';
import { Query } from '@/types/student/query.types';

interface QueryDetailModalProps {
  query: Query | null;
  onClose: () => void;
}

export const QueryDetailModal: React.FC<QueryDetailModalProps> = ({
  query,
  onClose,
}) => {
  if (!query) return null;

  const statusConfig = getStatusConfig(query.status);
  const priorityConfig = getPriorityConfig(query.priority);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {query.subject}
              </h2>
              <div className="flex items-center gap-3">
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
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
              <p className="text-gray-900 text-lg leading-relaxed">
                {query.content}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600 font-semibold">
                  To: {query.to.name} ({query.to.role})
                </span>
                <span className="text-gray-500">
                  {new Date(query.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {query.responses && query.responses.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Responses
                </h3>
                <div className="space-y-4">
                  {query.responses.map((response) => (
                    <div
                      key={response._id}
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
                              {new Date(response.createdAt).toLocaleString()}
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
  );
};