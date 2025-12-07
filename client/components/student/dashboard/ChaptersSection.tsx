import { ChapterProgressByUnit } from '@/hooks/useStudentDashboard';
import React from 'react';
interface ChaptersSectionProps {
  units: ChapterProgressByUnit[];
}
export const ChaptersSection: React.FC<ChaptersSectionProps> = ({ units }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>📖</span> Chapter Progress by Unit
      </h2>
      <div className="space-y-6">
        {units.map((unit, idx) => (
          <div key={idx} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 text-lg">{unit.unitName}</h3>
              <span className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {unit.completionRate}%
              </span>
            </div>
            <div className="flex h-3 mb-3 overflow-hidden rounded-full bg-gray-100 shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500" 
                style={{ width: `${(unit.completed / unit.total) * 100}%` }} 
              />
              <div 
                className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" 
                style={{ width: `${(unit.inProgress / unit.total) * 100}%` }} 
              />
              <div 
                className="bg-gradient-to-r from-gray-300 to-gray-400 transition-all duration-500" 
                style={{ width: `${(unit.locked / unit.total) * 100}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 font-medium">
              <span>✅ {unit.completed} Completed</span>
              <span>⏳ {unit.inProgress} In Progress</span>
              <span>🔒 {unit.locked} Locked</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};