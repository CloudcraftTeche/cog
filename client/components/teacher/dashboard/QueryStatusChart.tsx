import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MessageSquare, Target } from 'lucide-react';

interface QueryStatus {
  status: string;
  count: number;
}

interface QueryStatusChartProps {
  data: QueryStatus[];
}

export const QueryStatusChart: React.FC<QueryStatusChartProps> = ({ data }) => {
  const COLORS = {
    open: '#f59e0b',
    'in-progress': '#3b82f6',
    resolved: '#10b981',
    closed: '#6b7280',
  };

  const GRADIENTS = {
    open: ['#f59e0b', '#ea580c'],
    'in-progress': ['#3b82f6', '#2563eb'],
    resolved: ['#10b981', '#059669'],
    closed: ['#6b7280', '#475569'],
  };

  const statusLabels = {
    open: 'Open',
    'in-progress': 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  const statusIcons = {
    open: '🔔',
    'in-progress': '⚡',
    resolved: '✅',
    closed: '📦',
  };

  const chartData = data.map(item => ({
    name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    value: item.count,
    status: item.status,
  }));

  const totalQueries = data.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / totalQueries) * 100).toFixed(1);
      return (
        <div className="bg-white px-5 py-3 rounded-xl shadow-2xl border-2 border-indigo-200">
          <p className="font-black text-gray-900 text-base">{payload[0].name}</p>
          <p className="text-sm font-bold text-gray-700 mt-1">
            {payload[0].value} queries ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border border-indigo-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            Query Distribution
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Overview of all student queries</p>
        </div>
        <div className="text-right bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-white mb-1">
            <MessageSquare className="w-5 h-5" />
            <div className="text-3xl font-black">{totalQueries}</div>
          </div>
          <div className="text-xs text-purple-100 font-semibold uppercase tracking-wide">Total Queries</div>
        </div>
      </div>

      <div className="h-80 bg-white/70 rounded-xl p-4 backdrop-blur-sm mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {Object.entries(GRADIENTS).map(([key, colors]) => (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={colors[0]} />
                  <stop offset="100%" stopColor={colors[1]} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }:any) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={3}
              stroke="#fff"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status as keyof typeof COLORS] || '#6b7280'} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{ fontWeight: 700 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {chartData.map((item) => {
          const gradient = GRADIENTS[item.status as keyof typeof GRADIENTS];
          const icon = statusIcons[item.status as keyof typeof statusIcons];
          const percentage = ((item.value / totalQueries) * 100).toFixed(1);
          
          return (
            <div 
              key={item.status} 
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ borderColor: COLORS[item.status as keyof typeof COLORS] }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                  {percentage}%
                </span>
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">{item.value}</div>
              <div className="text-xs font-bold uppercase tracking-wide" style={{ color: COLORS[item.status as keyof typeof COLORS] }}>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};