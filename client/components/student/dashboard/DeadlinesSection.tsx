import { Deadline } from '@/hooks/useStudentDashboard';
import React from 'react';
interface DeadlinesSectionProps {
  deadlines: Deadline[];
}
export const DeadlinesSection: React.FC<DeadlinesSectionProps> = ({ deadlines }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>⏰</span> Upcoming Deadlines
      </h2>
      {deadlines.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">✨ No upcoming deadlines</p>
          <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((deadline, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:border-red-200 transition-all hover:shadow-md group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                    {deadline.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    📅 {new Date(deadline.endDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {deadline.totalMarks} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};