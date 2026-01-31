// utils/queryConfig.tsx
import { PriorityConfig, QueryPriority, QueryStatus, StatusConfig } from '@/types/student/query.types';
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const getStatusConfig = (status: QueryStatus): StatusConfig => {
  const configs: Record<QueryStatus, StatusConfig> = {
    open: {
      color: 'from-blue-500 to-cyan-500',
      text: 'text-blue-700',
      bg: 'bg-blue-50',
      icon: AlertCircle,
    },
    in_progress: {
      color: 'from-yellow-500 to-orange-500',
      text: 'text-yellow-700',
      bg: 'bg-yellow-50',
      icon: Loader2,
    },
    resolved: {
      color: 'from-green-500 to-emerald-500',
      text: 'text-green-700',
      bg: 'bg-green-50',
      icon: CheckCircle2,
    },
    escalated: {
      color: 'from-purple-500 to-pink-500',
      text: 'text-purple-700',
      bg: 'bg-purple-50',
      icon: AlertCircle,
    },
    closed: {
      color: 'from-gray-500 to-slate-500',
      text: 'text-gray-700',
      bg: 'bg-gray-50',
      icon: CheckCircle2,
    },
  };

  return configs[status];
};

export const getPriorityConfig = (priority: QueryPriority): PriorityConfig => {
  const configs: Record<QueryPriority, PriorityConfig> = {
    low: {
      color: 'bg-gradient-to-r from-gray-400 to-gray-500',
      text: 'Low',
    },
    medium: {
      color: 'bg-gradient-to-r from-blue-400 to-blue-600',
      text: 'Medium',
    },
    high: {
      color: 'bg-gradient-to-r from-orange-400 to-orange-600',
      text: 'High',
    },
    urgent: {
      color: 'bg-gradient-to-r from-red-500 to-rose-600',
      text: 'Urgent',
    },
  };

  return configs[priority];
};