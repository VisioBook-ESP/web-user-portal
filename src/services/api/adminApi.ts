// Admin-only API endpoints
import { api } from "./baseApi";
import type { User } from "@/types";
import type { Project } from "@/types";
import type { AdminStats, ApplicationMetrics } from "@/types/api";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminApi = {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<PaginatedResponse<User>> {
    return api.get<PaginatedResponse<User>>("/users", {
      params: { page, limit, search },
    });
  },

  /**
   * Get all projects with user info (admin only)
   */
  async getAllProjects(
    page?: number,
    limit?: number,
    search?: string,
    status?: string,
  ): Promise<
    PaginatedResponse<
      Project & { username: string; userEmail: string; userProjects: number }
    >
  > {
    return api.get<
      PaginatedResponse<
        Project & { username: string; userEmail: string; userProjects: number }
      >
    >("/projects", {
      params: { page, limit, search, status },
    });
  },

  /**
   * Get admin statistics dashboard
   */
  async getAdminStats(): Promise<AdminStats> {
    return api.get<AdminStats>("/admin/stats");
  },

  /**
   * Get application metrics for monitoring
   */
  async getApplicationMetrics(
    timeRange?: "1h" | "24h" | "7d" | "30d",
  ): Promise<ApplicationMetrics[]> {
    return api.get<ApplicationMetrics[]>("/admin/metrics", {
      params: { timeRange },
    });
  },

  /**
   * Get user projects count
   */
  async getUserProjects(userId: number): Promise<PaginatedResponse<Project>> {
    return api.get<PaginatedResponse<Project>>(
      `/admin/users/${userId}/projects`,
    );
  },
};
