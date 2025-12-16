
export type QueryStatus = 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
export type QueryPriority = 'low' | 'medium' | 'high' | 'urgent';
export type QueryType = 'general' | 'academic' | 'disciplinary' | 'doctrinal' | 'technical';
export type ResponseType = 'standard' | 'broadcast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
  rollNumber?: string;
}

export interface QueryResponse {
  _id: string;
  from: User;
  content: string;
  responseType: ResponseType;
  createdAt: string;
  updatedAt: string;
}

export interface Query {
  _id: string;
  from: User;
  to: User;
  subject: string;
  content: string;
  queryType: QueryType;
  priority: QueryPriority;
  status: QueryStatus;
  isSensitive: boolean;
  tags: string[];
  responses: QueryResponse[];
  satisfactionRating?: number;
  assignedTo?: User;
  escalatedFrom?: User;
  escalationReason?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QueryStatistics {
  total: number;
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    escalated: number;
    closed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageRating: number;
  averageResponseTime: number;
}

export interface QueryFilters {
  status: QueryStatus | '';
  priority: QueryPriority | '';
  queryType: QueryType | '';
  search?: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface Recipients {
  teachers: User[];
  admins: User[];
  superAdmins: User[];
}

export interface CreateQueryData {
  to: string;
  subject: string;
  content: string;
  queryType: QueryType;
  priority: QueryPriority;
  isSensitive: boolean;
  tags: string[];
  attachments?: File[];
}

export interface AssignQueryData {
  assignedTo: string;
}

export interface EscalateQueryData {
  to: string;
  reason: string;
}

export interface UpdateStatusData {
  status: QueryStatus;
}

export interface AddResponseData {
  content: string;
  responseType?: ResponseType;
}

export interface AddRatingData {
  rating: number;
}



export interface Response {
  _id: string;
  from: User;
  content: string;
  responseType?: 'direct' | 'broadcast';
  createdAt: string;
}



export interface Statistics {
  total: number;
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    escalated: number;
    closed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageRating: number;
  averageResponseTime?: number;
}

export interface Filters {
  status: string;
  priority: string;
  queryType: string;
  search?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface QueryListResponse {
  success: boolean;
  data: Query[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export interface StatisticsResponse {
  success: boolean;
  data: Statistics;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
}

export interface QueryResponse {
  success: boolean;
  data: Query;
  message?: string;
}

export interface AssignData {
  userId: string;
}

export interface EscalationData {
  to: string;
  reason: string;
}