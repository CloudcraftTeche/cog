import React from 'react';
interface ErrorAlertProps {
  message: string | null;
  onRetry: () => void;
}
export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center border border-red-100">
      <p className="text-3xl mb-4">⚠️</p>
      <p className="text-red-600 font-semibold mb-4">{message || 'Failed to load dashboard'}</p>
      <button 
        onClick={onRetry} 
        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
      >
        Try Again
      </button>
    </div>
  </div>
);