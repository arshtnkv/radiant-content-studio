// Django API Client
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Загружаем токены из localStorage при инициализации
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && this.refreshToken) {
      // Попытка обновить токен
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Повторяем запрос с новым токеном
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers,
        });
        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }
        return retryResponse.json();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    // Для 204 No Content возвращаем пустой объект
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.accessToken = response.access_token;
    this.refreshToken = response.refresh_token;
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      this.accessToken = data.access_token;
      localStorage.setItem('access_token', data.access_token);
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) return null;

    try {
      return await this.request<User>('/auth/me');
    } catch {
      return null;
    }
  }

  async checkAdmin(): Promise<boolean> {
    try {
      const response = await this.request<{ is_admin: boolean }>('/auth/check-admin');
      return response.is_admin;
    } catch {
      return false;
    }
  }

  // Pages methods
  async getPages(filters?: { is_published?: boolean; is_home?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.is_published !== undefined) {
      params.append('is_published', String(filters.is_published));
    }
    if (filters?.is_home !== undefined) {
      params.append('is_home', String(filters.is_home));
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/pages${query}`);
  }

  async getPageBySlug(slug: string) {
    return this.request<any>(`/pages/${slug}`);
  }

  async createPage(page: any) {
    return this.request<any>('/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  async updatePage(id: string, page: any) {
    return this.request<any>(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
  }

  async deletePage(id: string) {
    return this.request<void>(`/pages/${id}`, {
      method: 'DELETE',
    });
  }

  // Content Blocks methods
  async getPageBlocks(pageId: string) {
    return this.request<any[]>(`/pages/${pageId}/blocks`);
  }

  async upsertBlocks(pageId: string, blocks: any[]) {
    return this.request<any[]>(`/pages/${pageId}/blocks/upsert`, {
      method: 'POST',
      body: JSON.stringify(blocks),
    });
  }

  async deleteBlock(blockId: string) {
    return this.request<void>(`/blocks/${blockId}`, {
      method: 'DELETE',
    });
  }

  // Settings methods
  async getSettings() {
    return this.request<any>('/settings');
  }

  async updateSettings(settings: any) {
    return this.request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // File upload methods
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const apiClient = new ApiClient();
