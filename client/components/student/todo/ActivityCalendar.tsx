// components/dashboard/ActivityCalendar.tsx
import { CalendarDay } from '@/types/student/todo.types';
import { getIntensityColor } from '@/utils/student/todoFilters';
import React from 'react';

interface ActivityCalendarProps {
  calendar: CalendarDay[];
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  calendar,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📅</span> Activity Calendar (Last 30 Days)
      </h3>
      <div className="grid grid-cols-15 gap-2">
        {calendar.map((day, idx) => (
          <div key={idx} className="group relative">
            <div
              className={`w-8 h-8 rounded ${getIntensityColor(day.count)} transition-all hover:scale-110 cursor-pointer`}
              title={`${new Date(day.date).toLocaleDateString()}: ${day.count} completions`}
            />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {new Date(day.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              : {day.count}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-4 h-4 bg-green-300 rounded"></div>
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <div className="w-4 h-4 bg-green-600 rounded"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};