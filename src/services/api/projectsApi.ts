// src/services/api/projectsApi.ts
import { api } from './baseApi';
import type {
  Project,
  CreateProjectData,
  ProjectFilters,
  WorkflowStatus,
  VisioBook,
} from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const projectsApi = {
  /**
   * Get all projects with filters
   */
  async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    return api.get<PaginatedResponse<Project>>('/projects', { params: filters });
  },

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<Project> {
    return api.get<Project>(`/projects/${projectId}`);
  },

  /**
   * Create new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    if (data.sourceFile) {
      // If there's a file, use upload endpoint
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.config) formData.append('config', JSON.stringify(data.config));
      formData.append('sourceFile', data.sourceFile);

      return api.post<Project>('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    return api.post<Project>('/projects', data);
  },

  /**
   * Update project
   */
  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    return api.patch<Project>(`/projects/${projectId}`, data);
  },

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    return api.delete(`/projects/${projectId}`);
  },

  /**
   * Start project processing
   */
  async startProcessing(projectId: string): Promise<WorkflowStatus> {
    return api.post<WorkflowStatus>(`/projects/${projectId}/process`);
  },

  /**
   * Get workflow status
   */
  async getWorkflowStatus(projectId: string): Promise<WorkflowStatus> {
    return api.get<WorkflowStatus>(`/projects/${projectId}/workflow`);
  },

  /**
   * Cancel project processing
   */
  async cancelProcessing(projectId: string): Promise<void> {
    return api.post(`/projects/${projectId}/cancel`);
  },

  /**
   * Get generated VisioBook
   */
  async getVisioBook(projectId: string): Promise<VisioBook> {
    return api.get<VisioBook>(`/projects/${projectId}/visiobook`);
  },

  /**
   * Download VisioBook video
   */
  async downloadVisioBook(projectId: string): Promise<Blob> {
    return api.get(`/projects/${projectId}/visiobook/download`, {
      responseType: 'blob',
    });
  },

  /**
   * Duplicate project
   */
  async duplicateProject(projectId: string): Promise<Project> {
    return api.post<Project>(`/projects/${projectId}/duplicate`);
  },
};
