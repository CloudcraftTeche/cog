// types/todo.types.ts
export interface Stats {
  totalChapters: number;
  completedChapters: number;
  completionPercentage: number;
  pendingAssignments: number;
  totalAssignments: number;
  submittedAssignments: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  endDate: string;
  isPastDue: boolean;
  daysLeft: number;
  isSubmitted?: boolean;
  score?: number | null;
  submittedAt?: string;
  feedback?: string;
}

export interface Chapter {
  _id: string;
  title: string;
  description: string;
  status: string;
  isCompleted: boolean;
  score?: number;
}

export interface Activity {
  _id: string;
  assignment: string;
  createdAt: string;
  score?: number;
  status: string;
}

export interface CalendarDay {
  date: string;
  count: number;
  hasActivity: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  last30DaysCompletions: number;
  calendar: CalendarDay[];
  streakMessage: string;
}

export interface OverviewData {
  streak: number;
  stats: Stats;
  dueAssignments: Assignment[];
  todayChapters: Chapter[];
  recentActivity: Activity[];
}

export interface AssignmentsApiResponse {
  success: boolean;
  data: Assignment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export type AssignmentFilterStatus = 'all' | 'pending' | 'submitted' | 'overdue';

export interface AssignmentQueryParams {
  status: AssignmentFilterStatus;
  page: number;
  limit: number;
}