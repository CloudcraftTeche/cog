import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users } from 'lucide-react';

interface PerformanceData {
  grade: string;
  students: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}

interface StudentPerformanceChartProps {
  data: PerformanceData[];
}

export const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border border-green-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            Student Performance
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Chapter completion across all grades</p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg">
          <Users className="w-4 h-4" />
          <span className="font-black text-sm">{data.reduce((sum, g) => sum + g.students, 0)} Students</span>
        </div>
      </div>

      <div className="h-80 bg-white/70 rounded-xl p-4 backdrop-blur-sm mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="inProgressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="notStartedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis 
              dataKey="grade" 
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            />
            <YAxis 
              tick={{ fill: '#374151', fontSize: 12, fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #10b981',
                borderRadius: '12px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                padding: '12px'
              }}
              cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 700 }}
              iconType="circle"
            />
            <Bar 
              dataKey="completed" 
              fill="url(#completedGradient)" 
              name="Completed" 
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="inProgress" 
              fill="url(#inProgressGradient)" 
              name="In Progress" 
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="notStarted" 
              fill="url(#notStartedGradient)" 
              name="Not Started" 
              radius={[8, 8, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((grade) => (
          <div 
            key={grade.grade} 
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-sm">{grade.grade}</span>
                </div>
                <span className="text-sm font-bold text-gray-700">Grade {grade.grade}</span>
              </div>
              <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
                {grade.students} students
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t-2 border-blue-200">
              <span className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {grade.completionRate}%
              </span>
              <span className="text-xs font-bold text-gray-600 uppercase">Completion</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};