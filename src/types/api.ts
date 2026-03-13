// src/types/api.ts

export interface Upload {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface UploadResult {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface Modal {
  id: string;
  component: string;
  props?: Record<string, any>;
  persistent?: boolean;
}

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}
