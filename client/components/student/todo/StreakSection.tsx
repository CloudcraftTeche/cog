// components/dashboard/StreakSection.tsx
import { StreakData } from '@/types/student/todo.types';
import React from 'react';

interface StreakSectionProps {
  currentStreak: number;
  streakData: StreakData | null;
}

export const StreakSection: React.FC<StreakSectionProps> = ({
  currentStreak,
  streakData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium opacity-90">Current Streak</p>
            <h2 className="text-5xl font-bold mt-2">{currentStreak}</h2>
            <p className="text-sm mt-1 opacity-90">days</p>
          </div>
          <div className="text-6xl animate-pulse">🔥</div>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-xs font-medium">
            {streakData?.streakMessage ?? 'Keep going!'}
          </p>
        </div>
      </div>

      {streakData && (
        <>
          <div className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🏆</span>
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl font-bold">
                  {streakData.longestStreak}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Longest Streak</p>
            <p className="text-2xl font-bold mt-1">
              {streakData.longestStreak} days
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📈</span>
              <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl font-bold">
                  {streakData.last30DaysCompletions}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Last 30 Days</p>
            <p className="text-2xl font-bold mt-1">
              {streakData.last30DaysCompletions} completions
            </p>
          </div>
        </>
      )}
    </div>
  );
};