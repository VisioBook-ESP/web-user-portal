<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { adminApi } from "@/services/api/adminApi";
import { projectsApi } from "@/services/api/projectsApi";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import Footer from "@/components/layout/Footer/Footer.vue";
import { Search, Play, Pencil, Trash2, Eye, X } from "lucide-vue-next";
import type { Project } from "@/types";

interface AdminProject extends Project {
  username: string;
  userEmail: string;
  userProjects: number;
  userId: string;
}

const router = useRouter();
const authStore = useAuthStore();
const { gradientStyle } = useGradientBackground();

// State
const projects = ref<AdminProject[]>([]);
const filteredProjects = ref<AdminProject[]>([]);
const searchQuery = ref("");
const statusFilter = ref<
  "all" | "draft" | "processing" | "completed" | "failed"
>("all");
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const totalProjects = ref(0);

// Check admin access
if (!authStore.isAdmin) {
  router.push("/dashboard");
}

// Computed
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredProjects.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() =>
  Math.ceil(filteredProjects.value.length / pageSize.value),
);

const statusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Methods
const loadProjects = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await adminApi.getAllProjects(
      1,
      100,
      searchQuery.value || undefined,
      statusFilter.value === "all" ? undefined : statusFilter.value,
    );
    console.log("Projects response:", response);

    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      projects.value = response;
      totalProjects.value = response.length;
    } else if (response?.data) {
      projects.value = response.data;
      totalProjects.value = response.total || response.data.length;
    } else {
      projects.value = [];
      totalProjects.value = 0;
    }
    applyFilters();
  } catch (err: any) {
    console.error("Failed to load projects:", err);
    error.value = err.message || "Failed to load projects";
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
  let filtered = projects.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.username.toLowerCase().includes(query) ||
        p.userEmail.toLowerCase().includes(query),
    );
  }

  if (statusFilter.value !== "all") {
    filtered = filtered.filter((p) => p.status === statusFilter.value);
  }

  filteredProjects.value = filtered;
  currentPage.value = 1;
};

const handleSearch = () => {
  applyFilters();
};

const handleDeleteProject = async (projectId: string) => {
  if (confirm("Are you sure you want to delete this project?")) {
    try {
      await projectsApi.deleteProject(projectId);
      await loadProjects();
    } catch (err: any) {
      error.value = err.message || "Failed to delete project";
    }
  }
};

const goToUserProjects = (userId: string) => {
  router.push(`/admin/user/${userId}/projects`);
};

const goToProjectDetail = (projectId: string) => {
  router.push({ name: "admin-project-detail", params: { id: projectId } });
};

const goToPlayerView = (projectId: string) => {
  router.push(`/projects/${projectId}/player`);
};

onMounted(() => {
  loadProjects();
});
</script>

<template>
  <div class="admin-projects-view" :style="gradientStyle">
    <Navbar />
    <main class="admin-content">
      <div class="admin-container">
        <div class="admin-header">
          <h1>Admin - Projects Management</h1>
          <p class="text-gray-600">Manage all user projects</p>
        </div>

        <!-- Search and Filter Section -->
        <div class="search-filter-section">
          <div class="search-bar">
            <Search :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by project name, username, or email..."
              @keyup.enter="handleSearch"
              class="search-input"
            />
          </div>

          <div class="filter-controls">
            <select
              v-model="statusFilter"
              @change="applyFilters"
              class="status-filter"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <button @click="handleSearch" class="search-btn">Search</button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-banner">
          <X :size="18" />
          {{ error }}
          <button @click="error = null" class="close-error">
            <X :size="16" />
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-spinner">Loading projects...</div>

        <!-- Projects Table -->
        <div v-else class="projects-table-wrapper">
          <table class="projects-table">
            <thead>
              <tr>
                <th>Project Title</th>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in paginatedProjects" :key="project.id">
                <td class="project-title">{{ project.title }}</td>
                <td class="user-name">{{ project.username }}</td>
                <td class="user-email">{{ project.userEmail }}</td>
                <td class="status-cell">
                  <span :class="['status-badge', statusColor(project.status)]">
                    {{ project.status }}
                  </span>
                </td>
                <td class="created-date">
                  {{ new Date(project.createdAt).toLocaleDateString() }}
                </td>
                <td class="actions-cell">
                  <button
                    @click="goToPlayerView(project.id)"
                    class="action-btn view-btn"
                    title="View Player"
                  >
                    <Play :size="16" />
                  </button>
                  <button
                    @click="goToProjectDetail(project.id)"
                    class="action-btn edit-btn"
                    title="Edit Project"
                  >
                    <Pencil :size="16" />
                  </button>
                  <button
                    @click="goToUserProjects(project.userId)"
                    class="action-btn view-user-btn"
                    title="View User Profile"
                  >
                    <Eye :size="16" />
                  </button>
                  <button
                    @click="handleDeleteProject(project.id)"
                    class="action-btn delete-btn"
                    title="Delete Project"
                  >
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedProjects.length === 0">
                <td colspan="6" class="no-data">No projects found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="pagination-btn"
          >
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped lang="scss">
.admin-projects-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  padding: 80px 20px 40px;
  backdrop-filter: blur(0px);
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.admin-header {
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
  }
}

.search-filter-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 300px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 12px;

  svg {
    color: #999;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px 0;
    font-size: 14px;

    &::placeholder {
      color: #999;
    }
  }
}

.filter-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.status-filter {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: #ccc;
  }
}

.search-btn {
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #333;
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #c33;
  font-size: 14px;

  .close-error {
    background: none;
    border: none;
    cursor: pointer;
    color: #c33;
    display: flex;
    align-items: center;
    margin-left: auto;
  }
}

.loading-spinner {
  text-align: center;
  padding: 40px;
  color: #666;
}

.projects-table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f0f0f0;

    th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      color: #1a1a1a;
      text-transform: uppercase;
      border-bottom: 2px solid #e0e0e0;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.1s;

      &:hover {
        background: #f9f9f9;
      }

      td {
        padding: 14px 16px;
        font-size: 14px;
        color: #1a1a1a;
      }
    }
  }
}

.project-title {
  font-weight: 500;
}

.user-name {
  color: #666;
}

.user-email {
  color: #999;
  font-size: 13px;
}

.status-cell {
  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
}

.created-date {
  color: #999;
  font-size: 13px;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.2s;

  svg {
    stroke-width: 2;
  }

  &.view-btn {
    color: #2563eb;

    &:hover {
      background: rgba(37, 99, 235, 0.1);
    }
  }

  &.edit-btn {
    color: #f59e0b;

    &:hover {
      background: rgba(245, 158, 11, 0.1);
    }
  }

  &.view-user-btn {
    color: #8b5cf6;

    &:hover {
      background: rgba(139, 92, 246, 0.1);
    }
  }

  &.delete-btn {
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

.no-data {
  text-align: center;
  padding: 40px 16px;
  color: #999;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;

  .page-info {
    font-size: 14px;
    color: #666;
  }
}

.pagination-btn {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #999;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
