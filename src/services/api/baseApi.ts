// src/services/api/baseApi.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '@/types';
import { TokenService } from '@/services/auth/tokenService';

class ApiService {
  private instance: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

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
    // Request interceptor
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

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh token
            const newToken = await this.refreshToken();
            
            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.instance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            TokenService.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        const apiError: ApiError = {
          code: error.response?.status || 500,
          message: error.response?.data?.message || 'An unexpected error occurred',
          details: error.response?.data?.details,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private async refreshToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = (async () => {
      try {
        const refreshToken = TokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        TokenService.setTokens(accessToken, newRefreshToken);

        return accessToken;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    return this.refreshTokenPromise;
  }

  // Public methods
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

  // Helper for file uploads
  upload<T = any>(url: string, file: File, onUploadProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    return this.instance.post<T, T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    });
  }
}

export const api = new ApiService();
export default api;
