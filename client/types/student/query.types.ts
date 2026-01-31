// types/query.types.ts
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

export interface QueryFilters {
  status: QueryStatus | '';
  priority: QueryPriority | '';
  queryType: QueryType | '';
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  totalPages?: number;
  currentPage?: number;
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

export interface StatusConfig {
  color: string;
  text: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PriorityConfig {
  color: string;
  text: string;
}

export interface QueryListParams {
  page: number;
  limit: number;
  status?: string;
  queryType?: string;
  priority?: string;
}