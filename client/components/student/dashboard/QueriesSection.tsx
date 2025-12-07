import { QueryStatus } from '@/hooks/useStudentDashboard';
import React from 'react';
interface QueriesSectionProps {
  queries: QueryStatus[];
}
export const QueriesSection: React.FC<QueriesSectionProps> = ({ queries }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; icon: string; color: string; bg: string }> = {
      open: { label: 'Open', icon: '📬', color: 'text-blue-600', bg: 'bg-blue-50' },
      in_progress: { label: 'In Progress', icon: '⏳', color: 'text-amber-600', bg: 'bg-amber-50' },
      resolved: { label: 'Resolved', icon: '✅', color: 'text-green-600', bg: 'bg-green-50' },
      escalated: { label: 'Escalated', icon: '🔺', color: 'text-red-600', bg: 'bg-red-50' },
      closed: { label: 'Closed', icon: '🔒', color: 'text-gray-600', bg: 'bg-gray-50' },
    };
    return configs[status] || configs.open;
  };
  const totalQueries = queries.reduce((sum, q) => sum + q.count, 0);
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all h-full overscroll-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>💬</span> My Queries
      </h2>
      {totalQueries === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No queries yet</p>
          <p className="text-sm text-gray-400 mt-2">Feel free to ask questions anytime</p>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-gray-600 mb-1">Total Queries</p>
            <p className="text-3xl font-bold text-indigo-600">{totalQueries}</p>
          </div>
          <div className="space-y-3">
            {queries.map((query, idx) => {
              const config = getStatusConfig(query.status);
              return (
                <div 
                  key={idx} 
                  className={`${config.bg} rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${config.color}`}>{query.count}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};