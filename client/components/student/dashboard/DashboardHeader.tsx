import React from 'react';
export const DashboardHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-indigo-100">Track your learning progress, assignments, and performance</p>
      </div>
    </div>
  );
};