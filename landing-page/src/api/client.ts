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

export type TagType = 'SCHOOL' | 'CUSTOM';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  type: TagType;
  _count?: { articles: number };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  tags: Tag[];
  author: { id: string; name: string };
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  sortOrder: number;
  parentId: string | null;
  parent?: { id: string; title: string; slug: string } | null;
  createdAt: string;
  updatedAt: string;
  fullPath?: string;
  _count?: { children: number };
}

export interface PageWithNavigation {
  page: Page;
  breadcrumbs: { id: string; title: string; slug: string }[];
  siblings: { id: string; title: string; slug: string }[];
  children: { id: string; title: string; slug: string }[];
  parent: { id: string; title: string; slug: string } | null;
  fullPath: string;
}

export interface PageTreeItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  sortOrder: number;
  parentId: string | null;
  children: PageTreeItem[];
}

export const tagsApi = {
  list: () => api.get<Tag[]>('/tags'),
  
  get: (id: string) => api.get<Tag>(`/tags/${id}`),
  
  create: (data: { name: string; slug: string; type?: TagType }) =>
    api.post<Tag>('/tags', data),
  
  update: (id: string, data: { name?: string }) =>
    api.put<Tag>(`/tags/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/tags/${id}`),
};

export const articlesApi = {
  list: (params?: { tag?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.tag) searchParams.set('tag', params.tag);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const query = searchParams.toString();
    return api.get<Article[]>(`/articles${query ? `?${query}` : ''}`);
  },
  
  listAdmin: () => api.get<Article[]>('/articles/admin'),
  
  get: (slug: string) => api.get<Article>(`/articles/${slug}`),
  
  create: (data: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    coverImage?: string | null;
    published?: boolean;
    tagIds?: string[];
  }) => api.post<Article>('/articles', data),
  
  update: (id: string, data: {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content?: string;
    coverImage?: string | null;
    published?: boolean;
    tagIds?: string[];
  }) => api.put<Article>(`/articles/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/articles/${id}`),
};

export const pagesApi = {
  list: () => api.get<Page[]>('/pages'),
  
  listAdmin: () => api.get<Page[]>('/pages/admin'),
  
  tree: (all?: boolean) => api.get<PageTreeItem[]>(`/pages/tree${all ? '?all=true' : ''}`),
  
  get: (slug: string) => api.get<PageWithNavigation>(`/pages/${slug}`),
  
  getByPath: (path: string) => api.get<PageWithNavigation>(`/pages/by-path/${path}`),
  
  create: (data: {
    title: string;
    slug: string;
    content?: string;
    published?: boolean;
    sortOrder?: number;
    parentId?: string | null;
  }) => api.post<Page>('/pages', data),
  
  update: (id: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    published?: boolean;
    sortOrder?: number;
    parentId?: string | null;
  }) => api.put<Page>(`/pages/${id}`, data),
  
  delete: (id: string) => api.delete<{ message: string }>(`/pages/${id}`),
};

export const uploadApi = {
  image: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return handleResponse<{ filename: string; url: string; originalName: string }>(response);
  },
  
  deleteImage: (filename: string) =>
    api.delete<{ message: string }>(`/upload/image/${filename}`),
};
