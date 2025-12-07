import React from 'react';
import { MessageSquare, Clock, AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface Query {
  _id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  from: {
    _id: string;
    name: string;
    email: string;
    profilePictureUrl?: string;
  };
}

interface RecentQueriesTableProps {
  queries: Query[];
}

export const RecentQueriesTable: React.FC<RecentQueriesTableProps> = ({ queries }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { 
        icon: AlertCircle, 
        gradient: 'from-orange-500 to-red-500',
        bgGradient: 'from-orange-50 to-red-50',
        text: 'text-orange-700',
        border: 'border-orange-300'
      },
      'in-progress': { 
        icon: Clock, 
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-50 to-cyan-50',
        text: 'text-blue-700',
        border: 'border-blue-300'
      },
      resolved: { 
        icon: CheckCircle, 
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-50 to-emerald-50',
        text: 'text-green-700',
        border: 'border-green-300'
      },
      closed: { 
        icon: CheckCircle, 
        gradient: 'from-gray-500 to-slate-500',
        bgGradient: 'from-gray-50 to-slate-50',
        text: 'text-gray-700',
        border: 'border-gray-300'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${config.border} bg-gradient-to-r ${config.bgGradient} ${config.text} shadow-sm`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { gradient: 'from-red-500 to-pink-600', text: 'text-white', icon: '🔥' },
      medium: { gradient: 'from-yellow-500 to-orange-500', text: 'text-white', icon: '⚡' },
      low: { gradient: 'from-green-500 to-emerald-500', text: 'text-white', icon: '✓' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-gradient-to-r ${config.gradient} ${config.text} shadow-md`}>
        <span>{config.icon}</span>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border border-indigo-100 p-6 hover:shadow-2xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            Recent Queries
          </h2>
          <p className="text-sm text-gray-600 mt-2 ml-12">Latest student questions and requests</p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg">
          <Zap className="w-4 h-4" />
          <span className="font-black text-sm">{queries.length} Active</span>
        </div>
      </div>

      <div className="space-y-3">
        {queries.map((query) => (
          <div 
            key={query._id} 
            className="p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-indigo-300 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {query.from.profilePictureUrl ? (
                  <img 
                    src={query.from.profilePictureUrl} 
                    alt={query.from.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-4 ring-indigo-100 shadow-lg"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-blue-100">
                    <span className="text-white text-base font-black">
                      {getInitials(query.from.name)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 truncate text-base">{query.subject}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold text-indigo-600">{query.from.name}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{query.from.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="flex items-center gap-2">
                  {getStatusBadge(query.status)}
                  {getPriorityBadge(query.priority)}
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {formatDate(query.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {queries.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-600 font-semibold text-lg">No recent queries</p>
          <p className="text-gray-500 text-sm mt-2">New queries will appear here</p>
        </div>
      )}
    </div>
  );
};