import { useState, useEffect, useCallback, useMemo } from 'react';
interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  avatar?: string;
  department?: string;
}
interface IQuery {
  _id: string;
  from: IUser;
  to: IUser;
  subject: string;
  content: string;
  queryType: 'general' | 'academic' | 'disciplinary' | 'doctrinal' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  assignedTo?: IUser;
  responses: Array<{
    _id: string;
    from: IUser;
    content: string;
    createdAt: Date;
  }>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
interface IQueryFilters {
  status?: string;
  priority?: string;
  queryType?: string;
  search?: string;
  page?: number;
  limit?: number;
  assignedTo?: string;
  department?: string;
}
interface IPaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
    statistics?: any;
  };
}
class APIClient {
  private baseURL: string;
  private token: string | null = null;
  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }
  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
  async getQueries(filters: IQueryFilters = {}): Promise<IPaginatedResponse<IQuery>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return this.request<IPaginatedResponse<IQuery>>(
      `/queries/my-queries?${params.toString()}`
    );
  }
  async getAllQueries(filters: IQueryFilters = {}): Promise<IPaginatedResponse<IQuery>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return this.request<IPaginatedResponse<IQuery>>(
      `/queries/all?${params.toString()}`
    );
  }
  async getQueryById(id: string): Promise<{ success: boolean; data: IQuery }> {
    return this.request<{ success: boolean; data: IQuery }>(`/queries/${id}`);
  }
  async createQuery(data: any): Promise<{ success: boolean; data: IQuery }> {
    return this.request<{ success: boolean; data: IQuery }>('/queries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async addResponse(queryId: string, data: any): Promise<{ success: boolean; data: IQuery }> {
    return this.request<{ success: boolean; data: IQuery }>(`/queries/${queryId}/responses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async updateQueryStatus(queryId: string, data: any): Promise<{ success: boolean; data: IQuery }> {
    return this.request<{ success: boolean; data: IQuery }>(`/queries/${queryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  async deleteQuery(queryId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/queries/${queryId}`, {
      method: 'DELETE',
    });
  }
  async bulkUpdateQueries(data: {
    queryIds: string[];
    action: string;
    value?: any;
  }): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/queries/bulk-update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async getAnalytics(): Promise<{ success: boolean; data: any }> {
    return this.request<{ success: boolean; data: any }>('/queries/analytics');
  }
  async getUsers(filters: any = {}): Promise<IPaginatedResponse<IUser>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]:any) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    return this.request<IPaginatedResponse<IUser>>(`/users?${params.toString()}`);
  }
}
const apiClient = new APIClient();
export const useQueries = (filters: IQueryFilters = {}) => {
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [statistics, setStatistics] = useState<any>(null);
  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getQueries(filters);
      if (response.success) {
        setQueries(response.data.items);
        setPagination(response.data.pagination);
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
      } else {
        throw new Error('Failed to fetch queries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);
  const refetch = useCallback(() => {
    fetchQueries();
  }, [fetchQueries]);
  return { 
    queries, 
    loading, 
    error, 
    pagination, 
    statistics, 
    refetch 
  };
};
export const useAllQueries = (filters: IQueryFilters = {}) => {
  const [queries, setQueries] = useState<IQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [statistics, setStatistics] = useState<any>(null);
  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAllQueries(filters);
      if (response.success) {
        setQueries(response.data.items);
        setPagination(response.data.pagination);
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
      } else {
        throw new Error('Failed to fetch queries');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQueries([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);
  const refetch = useCallback(() => {
    fetchQueries();
  }, [fetchQueries]);
  return { 
    queries, 
    loading, 
    error, 
    pagination, 
    statistics, 
    refetch 
  };
};
export const useQuery = (queryId: string) => {
  const [query, setQuery] = useState<IQuery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchQuery = useCallback(async () => {
    if (!queryId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getQueryById(queryId);
      if (response.success) {
        setQuery(response.data);
      } else {
        throw new Error('Failed to fetch query');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQuery(null);
    } finally {
      setLoading(false);
    }
  }, [queryId]);
  useEffect(() => {
    fetchQuery();
  }, [fetchQuery]);
  const refetch = useCallback(() => {
    fetchQuery();
  }, [fetchQuery]);
  return { query, loading, error, refetch };
};
export const useCreateQuery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createQuery = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.createQuery(data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to create query');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { createQuery, loading, error };
};
export const useAddResponse = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addResponse = useCallback(async (queryId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.addResponse(queryId, data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to add response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { addResponse, loading, error };
};
export const useUpdateQueryStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateStatus = useCallback(async (queryId: string, data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.updateQueryStatus(queryId, data);
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to update query status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { updateStatus, loading, error };
};
export const useBulkActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const performBulkAction = useCallback(async (data: {
    queryIds: string[];
    action: string;
    value?: any;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.bulkUpdateQueries(data);
      if (response.success) {
        return response;
      } else {
        throw new Error('Failed to perform bulk action');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  return { performBulkAction, loading, error };
};
export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAnalytics();
      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);
  const refetch = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);
  return { analytics, loading, error, refetch };
};
export const useUsers = (filters: any = {}) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getUsers(filters);
      if (response.success) {
        setUsers(response.data.items);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  return { users, loading, error, refetch: fetchUsers };
};
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};
export const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString();
};
export const getTimeAgo = (date: Date | string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return 'Just now';
};
export default apiClient;