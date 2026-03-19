// src/services/api/baseApi.ts
// core-user-service uses JWT RS256 with no refresh-token endpoint.
// On 401 we simply clear the stored token and redirect to home.
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { TokenService } from '@/services/auth/tokenService';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Attach Bearer token to every request when present
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenService.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Normalise error shape; on 401 clear auth and go home
    this.instance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          TokenService.clearTokens();
          window.location.href = '/';
        }

        const data = error.response?.data as any;
        const apiError: ApiError = {
          code: error.response?.status || 500,
          // FastAPI validation errors surface as data.detail (string or array)
          message:
            (typeof data?.detail === 'string' ? data.detail : null) ||
            data?.message ||
            'An unexpected error occurred',
          details: data?.detail,
        };

        return Promise.reject(apiError);
      }
    );
  }

  get<T = any>(url: string, config = {}) {
    return this.instance.get<T, T>(url, config);
  }

  post<T = any>(url: string, data?: any, config = {}) {
    return this.instance.post<T, T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config = {}) {
    return this.instance.put<T, T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config = {}) {
    return this.instance.patch<T, T>(url, data, config);
  }

  delete<T = any>(url: string, config = {}) {
    return this.instance.delete<T, T>(url, config);
  }

  upload<T = any>(url: string, file: File, onUploadProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post<T, T>(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          onUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      },
    });
  }
}

export const api = new ApiService();
export default api;
