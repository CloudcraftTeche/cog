import { PerformanceData } from '@/hooks/useStudentDashboard';
import React from 'react';
interface PerformanceSectionProps {
  data: PerformanceData[];
}
export const PerformanceSection: React.FC<PerformanceSectionProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>📈</span> Recent Performance
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No performance data yet</p>
          <p className="text-sm text-gray-400 mt-2">Complete chapters to see your progress</p>
        </div>
      </div>
    );
  }
  const maxScore = 100;
  const avgScore = Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length);
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📈</span> Recent Performance
      </h2>
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
        <p className="text-sm text-gray-600 mb-1">Average Score</p>
        <p className="text-3xl font-bold text-indigo-600">{avgScore}</p>
      </div>
      <div className="flex items-end justify-between gap-1 h-56">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center group">
            <div className="w-full relative" style={{ height: '180px' }}>
              <div className="absolute bottom-0 w-full bg-gray-100 rounded-t-lg transition-all duration-300 group-hover:shadow-lg" style={{ height: '100%' }}>
                <div 
                  className="w-full bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t-lg transition-all duration-500 group-hover:from-indigo-600 group-hover:to-blue-500 relative shadow-md" 
                  style={{ height: `${(item.score / maxScore) * 100}%` }}
                >
                  <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-sm font-bold text-indigo-600 bg-white px-2 py-1 rounded-lg shadow-sm">
                    {item.score}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center line-clamp-2 max-w-full">
              Ch {item.chapterNumber}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};