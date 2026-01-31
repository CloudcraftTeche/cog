// components/dashboard/ChaptersSection.tsx
import React from 'react';
import type { Chapter } from '@/types/student/todo.types';

interface ChaptersSectionProps {
  chapters: Chapter[];
}

export const ChaptersSection: React.FC<ChaptersSectionProps> = ({ chapters }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>📖</span> Today's Learning
      </h3>
      <div className="space-y-3">
        {chapters.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">✨</p>
            <p className="text-lg font-semibold">All chapters completed!</p>
            <p className="text-sm mt-1">Great job!</p>
          </div>
        ) : (
          chapters.map((chapter) => (
            <div
              key={chapter._id}
              className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-md hover:border-purple-300 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                    {chapter.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {chapter.description}
                  </p>
                </div>
                <div className="ml-4 bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                  <span className="text-xl">▶️</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};