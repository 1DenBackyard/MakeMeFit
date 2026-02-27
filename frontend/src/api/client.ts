/** API client for backend communication. */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // No auth token needed - backend will use mock user automatically
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    
    if (options.body) {
      console.log(`[API] Request body:`, options.body);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      console.log(`[API] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData: ApiError = await response.json();
          errorDetail = errorData.detail || errorDetail;
        } catch {
          // If JSON parsing fails, use status text
          const text = await response.text().catch(() => '');
          if (text) {
            errorDetail = text;
          }
        }
        
        console.error(`[API] Error ${response.status}:`, errorDetail);
        throw new Error(errorDetail);
      }

      const data = await response.json();
      console.log(`[API] Response data:`, data);
      return data;
    } catch (error) {
      console.error(`[API] Fetch error:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to fetch');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();
