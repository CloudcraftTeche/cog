import React from 'react';
import { Calendar, Clock, Award, AlertTriangle } from 'lucide-react';

interface Assignment {
  title: string;
  endDate: string;
  grade: string;
  totalMarks: number;
}

interface UpcomingAssignmentsCardProps {
  assignments: Assignment[];
}

export const UpcomingAssignmentsCard: React.FC<UpcomingAssignmentsCardProps> = ({ assignments }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { 
      text: 'Overdue', 
      gradient: 'from-red-500 to-rose-600', 
      textColor: 'text-white',
      icon: AlertTriangle,
      pulse: true
    };
    if (diffDays === 0) return { 
      text: 'Due Today', 
      gradient: 'from-orange-500 to-red-500', 
      textColor: 'text-white',
      icon: AlertTriangle,
      pulse: true
    };
    if (diffDays === 1) return { 
      text: 'Tomorrow', 
      gradient: 'from-yellow-500 to-orange-500', 
      textColor: 'text-white',
      icon: Clock,
      pulse: false
    };
    if (diffDays <= 3) return { 
      text: `${diffDays} days`, 
      gradient: 'from-amber-500 to-yellow-500', 
      textColor: 'text-white',
      icon: Clock,
      pulse: false
    };
    return { 
      text: `${diffDays} days`, 
      gradient: 'from-green-500 to-emerald-500', 
      textColor: 'text-white',
      icon: Calendar,
      pulse: false
    };
  };

  return (
    <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-xl border border-amber-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            Upcoming Deadlines
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Assignments Due Soon</p>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, index) => {
          const daysInfo = getDaysUntil(assignment.endDate);
          const Icon = daysInfo.icon;
          
          return (
            <div 
              key={index} 
              className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-amber-300 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="font-bold text-gray-900 flex-1 text-base">{assignment.title}</h3>
                <span className={`px-3 py-2 rounded-xl text-xs font-black shadow-lg bg-gradient-to-r ${daysInfo.gradient} ${daysInfo.textColor} whitespace-nowrap flex items-center gap-1.5 ${daysInfo.pulse ? 'animate-pulse' : ''}`}>
                  <Icon className="w-4 h-4" />
                  {daysInfo.text}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-700">Grade {assignment.grade}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Due: {formatDate(assignment.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-2 rounded-xl font-black text-sm shadow-lg">
                    <Award className="w-4 h-4" />
                    <span>{assignment.totalMarks} marks</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">No upcoming assignments</p>
          <p className="text-gray-500 text-sm mt-2">All caught up!</p>
        </div>
      )}
    </div>
  );
};