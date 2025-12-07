import React from 'react';
import { BookOpen, CheckCircle, Clock, Circle, Award } from 'lucide-react';

interface ChapterStatus {
  status: string;
  count: number;
}

interface ChapterProgressChartProps {
  data: ChapterStatus[];
}

export const ChapterProgressChart: React.FC<ChapterProgressChartProps> = ({ data }) => {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      color: 'text-emerald-600',
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-300',
      progressBar: 'bg-gradient-to-r from-emerald-400 to-green-500',
      shadow: 'shadow-emerald-200'
    },
    in_progress: {
      icon: Clock,
      label: 'In Progress',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
      progressBar: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      shadow: 'shadow-blue-200'
    },
    not_started: {
      icon: Circle,
      label: 'Not Started',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      progressBar: 'bg-gradient-to-r from-purple-400 to-pink-500',
      shadow: 'shadow-purple-200'
    },
  };

  const formattedData = data.map(item => ({
    ...item,
    config: statusConfig[item.status as keyof typeof statusConfig] || statusConfig.not_started,
  }));

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            Chapter Progress
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Student Progress Overview</p>
        </div>
        <div className="text-right bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-white mb-1">
            <Award className="w-5 h-5" />
            <div className="text-3xl font-black">{total}</div>
          </div>
          <div className="text-xs text-indigo-100 font-semibold uppercase tracking-wide">Total Entries</div>
        </div>
      </div>

      <div className="space-y-5 mb-6">
        {formattedData.map((item) => {
          const Icon = item.config.icon;
          const percentage = getPercentage(item.count);
          
          return (
            <div key={item.status} className="bg-white/70 rounded-xl p-4 backdrop-blur-sm hover:bg-white transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${item.config.gradient} rounded-lg shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-base font-bold text-gray-900">{item.config.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    {item.count} chapters
                  </span>
                  <span className={`text-lg font-black ${item.config.color}`}>{percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                <div 
                  className={`h-4 rounded-full transition-all duration-700 shadow-lg ${item.config.progressBar}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-gray-200">
        {formattedData.map((item) => {
          const Icon = item.config.icon;
          
          return (
            <div 
              key={item.status} 
              className={`p-5 rounded-2xl bg-gradient-to-br ${item.config.bgGradient} border-2 ${item.config.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 bg-gradient-to-br ${item.config.gradient} rounded-lg shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900">{item.count}</div>
              <div className="text-xs text-gray-700 mt-2 font-semibold uppercase tracking-wide">{item.config.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};