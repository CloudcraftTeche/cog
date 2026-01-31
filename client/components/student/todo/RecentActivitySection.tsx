// components/dashboard/RecentActivitySection.tsx
import React from 'react';
import type { Activity } from '@/types/student/todo.types';

interface RecentActivitySectionProps {
  activities: Activity[];
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>⚡</span> Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-lg font-semibold">No recent activity</p>
            <p className="text-sm mt-1">Start learning to see your progress</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity._id}
              className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {activity.assignment}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Submitted{' '}
                    {new Date(activity.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                {activity.score !== undefined && activity.score !== null && (
                  <div className="bg-green-500 text-white rounded-full px-4 py-2 font-bold ml-4 flex-shrink-0">
                    {activity.score}%
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};