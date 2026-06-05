<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { projectsApi } from "@/services/api/projectsApi";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import Footer from "@/components/layout/Footer/Footer.vue";
import { ArrowLeft, Trash2, Play, Pencil, X } from "lucide-vue-next";
import type { Project } from "@/types";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { gradientStyle } = useGradientBackground();

// State
const project = ref<Project | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const showDeleteConfirm = ref(false);

// Check admin access
if (!authStore.isAdmin) {
  router.push("/dashboard");
}

// Methods
const loadProject = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const projectId = route.params.id as string;
    project.value = await projectsApi.getProject(projectId);
  } catch (err: any) {
    error.value = err.message || "Failed to load project";
  } finally {
    isLoading.value = false;
  }
};

const handleDelete = async () => {
  if (!project.value) return;

  try {
    await projectsApi.deleteProject(project.value.id);
    router.push("/admin/projects");
  } catch (err: any) {
    error.value = err.message || "Failed to delete project";
  }
};

const goToPlayer = () => {
  if (project.value) {
    router.push(`/projects/${project.value.id}/player`);
  }
};

const goToEdit = () => {
  if (project.value) {
    router.push(`/projects/${project.value.id}/edit`);
  }
};

const goBack = () => {
  router.back();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

onMounted(() => {
  loadProject();
});
</script>

<template>
  <div
    class="admin-project-detail-view"
    :style="gradientStyle"
  >
    <Navbar />
    <main class="admin-content">
      <div class="admin-container">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <button
            class="back-btn"
            @click="goBack"
          >
            <ArrowLeft :size="18" />
            Back to Projects
          </button>
        </div>

        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="loading-spinner"
        >
          Loading project information...
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="error-banner"
        >
          <X :size="18" />
          {{ error }}
        </div>

        <!-- Project Detail -->
        <div
          v-else-if="project"
          class="project-detail"
        >
          <div class="detail-header">
            <div class="header-content">
              <h1>{{ project.title }}</h1>
              <p class="text-gray-600">
                Project Details
              </p>
            </div>
            <div class="header-actions">
              <button
                class="action-btn player-btn"
                @click="goToPlayer"
              >
                <Play :size="18" />
                View Player
              </button>
              <button
                class="action-btn edit-btn"
                @click="goToEdit"
              >
                <Pencil :size="18" />
                Edit
              </button>
              <button
                class="action-btn delete-btn"
                @click="showDeleteConfirm = true"
              >
                <Trash2 :size="18" />
                Delete
              </button>
            </div>
          </div>

          <!-- Project Info Grid -->
          <div class="info-grid">
            <div class="info-card">
              <label>Status</label>
              <p>
                <span :class="['status-badge', statusColor(project.status)]">
                  {{ project.status }}
                </span>
              </p>
            </div>

            <div class="info-card">
              <label>Project ID</label>
              <p class="font-mono text-sm">
                {{ project.id }}
              </p>
            </div>

            <div class="info-card">
              <label>User ID</label>
              <p class="font-mono text-sm">
                {{ project.userId }}
              </p>
            </div>

            <div class="info-card">
              <label>Created</label>
              <p>{{ formatDate(project.createdAt) }}</p>
            </div>

            <div class="info-card">
              <label>Last Updated</label>
              <p>{{ formatDate(project.updatedAt) }}</p>
            </div>

            <div
              v-if="project.config"
              class="info-card"
            >
              <label>Quality</label>
              <p>{{ project.config.quality }}</p>
            </div>

            <div
              v-if="project.config"
              class="info-card"
            >
              <label>Style</label>
              <p>{{ project.config.style }}</p>
            </div>

            <div
              v-if="project.config"
              class="info-card"
            >
              <label>Audio Voice</label>
              <p>{{ project.config.audioVoice }}</p>
            </div>
          </div>

          <!-- Description Section -->
          <div
            v-if="project.description"
            class="description-section"
          >
            <h2>Description</h2>
            <div class="description-content">
              {{ project.description }}
            </div>
          </div>

          <!-- Source Section -->
          <div
            v-if="project.sourceText || project.sourceFile"
            class="source-section"
          >
            <h2>Source Information</h2>
            <div
              v-if="project.sourceText"
              class="source-item"
            >
              <label>Source Text</label>
              <div class="source-text">
                {{ project.sourceText }}
              </div>
            </div>
            <div
              v-if="project.sourceFile"
              class="source-item"
            >
              <label>Source File</label>
              <p>{{ project.sourceFile }}</p>
            </div>
          </div>
        </div>

        <!-- No Project Found -->
        <div
          v-else
          class="no-project"
        >
          <p>Project not found</p>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="modal-overlay"
      @click="showDeleteConfirm = false"
    >
      <div
        class="modal-content"
        @click.stop
      >
        <div class="modal-header">
          <h2>Delete Project?</h2>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete
            <strong>{{ project?.title }}</strong>
            ? This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button
            class="cancel-btn"
            @click="showDeleteConfirm = false"
          >
            Cancel
          </button>
          <button
            class="delete-confirm-btn"
            @click="handleDelete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped lang="scss">
.admin-project-detail-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  padding: 80px 20px 40px;
}

.admin-container {
  max-width: 1000px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.breadcrumb {
  margin-bottom: 24px;

  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #2563eb;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #1d4ed8;
    }
  }
}

.loading-spinner {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px 16px;
  color: #c33;
  font-size: 14px;
}

.project-detail {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;

  .header-content {
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    p {
      font-size: 14px;
      color: #666;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.player-btn {
    background: #2563eb;
    color: white;

    &:hover {
      background: #1d4ed8;
    }
  }

  &.edit-btn {
    background: #f59e0b;
    color: white;

    &:hover {
      background: #d97706;
    }
  }

  &.delete-btn {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.info-card {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  p {
    font-size: 16px;
    color: #1a1a1a;
    word-break: break-all;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }

  .font-mono {
    font-family: "Courier New", monospace;
  }
}

.description-section,
.source-section {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;

  h2 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 16px;
  }
}

.description-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.source-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #1a1a1a;
  }
}

.source-text {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: #666;
  max-height: 200px;
  overflow-y: auto;
  font-family: "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.no-project {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

// Modal Styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
}

.modal-body {
  padding: 24px;

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
  }

  strong {
    color: #1a1a1a;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.cancel-btn {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
  }
}

.delete-confirm-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #dc2626;
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 20px;
  }

  .detail-header {
    flex-direction: column;

    .header-actions {
      margin-top: 16px;
    }
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
