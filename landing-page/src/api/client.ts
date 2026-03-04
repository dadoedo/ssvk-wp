const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiError {
  error: string;
  details?: unknown;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<T>(response);
  },

  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return handleResponse<T>(response);
  },
};

export type Role = 'ADMIN' | 'SCHOOL_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Document {
  id: string;
  name: string;
  filename: string;
  filePath: string;
  dateAdded: string;
  tags: string[];
  createdBy: string | null;
  updatedAt: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User }>('/auth/login', { email, password }),
  
  logout: () => api.post<{ message: string }>('/auth/logout'),
  
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const documentsApi = {
  list: () => api.get<Document[]>('/documents'),
  
  get: (id: string) => api.get<Document>(`/documents/${id}`),
  
  create: (data: { name: string; filename: string; filePath: string; tags: string[] }) =>
    api.post<Document>('/documents', data),
  
  update: (id: string, data: { name?: string; tags?: string[] }) =>
    api.put<Document>(`/documents/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/documents/${id}`),
  
  upload: (file: File) =>
    api.upload<{ filename: string; filePath: string; originalName: string }>('/documents/upload', file),
};

export const adminApi = {
  listUsers: () => api.get<User[]>('/admin/users'),
  
  createUser: (data: { email: string; password: string; name: string; role: Role }) =>
    api.post<User>('/admin/users', data),
  
  updateUser: (id: string, data: { email?: string; password?: string; name?: string; role?: Role }) =>
    api.put<User>(`/admin/users/${id}`, data),
  
  deleteUser: (id: string) => api.delete<{ message: string }>(`/admin/users/${id}`),
};
