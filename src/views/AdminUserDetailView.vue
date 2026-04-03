<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { userApi } from "@/services/api/userApi";
import { adminApi } from "@/services/api/adminApi";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import Footer from "@/components/layout/Footer/Footer.vue";
import { ArrowLeft, Trash2, X, Check, Edit2 } from "lucide-vue-next";
import type { User, UpdateUserDto } from "@/types";
import type { Project } from "@/types";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { gradientStyle } = useGradientBackground();

// State
const user = ref<User | null>(null);
const userProjects = ref<Project[]>([]);
const isLoading = ref(false);
const isLoadingProjects = ref(false);
const error = ref<string | null>(null);
const showDeleteConfirm = ref(false);
const isEditMode = ref(false);

// Edit form state
const editForm = ref<UpdateUserDto>({
  username: "",
  first_name: "",
  last_name: "",
});

// Check admin access
if (!authStore.isAdmin) {
  router.push("/dashboard");
}

// Methods
const loadUser = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const userId = parseInt(route.params.id as string, 10);
    user.value = await userApi.getUser(userId);

    // Initialize edit form
    editForm.value = {
      username: user.value.username,
      first_name: user.value.first_name || "",
      last_name: user.value.last_name || "",
    };

    await loadUserProjects();
  } catch (err: any) {
    error.value = err.message || "Failed to load user";
  } finally {
    isLoading.value = false;
  }
};

const loadUserProjects = async () => {
  if (!user.value) return;

  isLoadingProjects.value = true;
  try {
    const response = await adminApi.getUserProjects(user.value.id);

    // Handle both direct array and paginated response
    if (Array.isArray(response)) {
      userProjects.value = response;
    } else if (response?.data) {
      userProjects.value = response.data;
    } else {
      userProjects.value = [];
    }
  } catch (err: any) {
    // Don't show error for projects - just empty list
  } finally {
    isLoadingProjects.value = false;
  }
};

const startEdit = () => {
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
  if (user.value) {
    editForm.value = {
      username: user.value.username,
      first_name: user.value.first_name || "",
      last_name: user.value.last_name || "",
    };
  }
};

const saveEdit = async () => {
  if (!user.value) return;

  try {
    const updated = await userApi.updateUser(user.value.id, editForm.value);
    user.value = updated;
    isEditMode.value = false;
  } catch (err: any) {
    error.value = err.message || "Failed to update user";
  }
};

const handleDelete = async () => {
  if (!user.value) return;

  try {
    await userApi.deleteUser(user.value.id);
    router.push("/admin/users");
  } catch (err: any) {
    error.value = err.message || "Failed to delete user";
  }
};

const goToProject = (projectId: string) => {
  router.push({ name: "admin-project-detail", params: { id: projectId } });
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

const roleColor = (role: string) => {
  return role === "admin"
    ? "bg-purple-100 text-purple-800"
    : "bg-blue-100 text-blue-800";
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
  loadUser();
});
</script>

<template>
  <div class="admin-user-detail-view" :style="gradientStyle">
    <Navbar />
    <main class="admin-content">
      <div class="admin-container">
        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <button class="back-btn" @click="goBack">
            <ArrowLeft :size="18" />
            Back to Users
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-spinner">
          Loading user information...
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-banner">
          <X :size="18" />
          {{ error }}
        </div>

        <!-- User Detail -->
        <div v-else-if="user" class="user-detail">
          <div class="detail-header">
            <div class="header-content">
              <h1>{{ user.username }}</h1>
              <p class="text-gray-600">User Profile</p>
            </div>
            <div class="header-actions">
              <button
                v-if="!isEditMode"
                class="action-btn edit-user-btn"
                @click="startEdit"
              >
                <Edit2 :size="18" />
                Edit
              </button>
              <button
                v-if="user.id !== authStore.user?.id"
                class="action-btn delete-btn"
                @click="showDeleteConfirm = true"
              >
                <Trash2 :size="18" />
                Delete User
              </button>
            </div>
          </div>

          <!-- Edit Form -->
          <div v-if="isEditMode" class="edit-form-section">
            <h2>Edit User Information</h2>
            <div class="form-grid">
              <div class="form-group">
                <label for="username">Username</label>
                <input
                  id="username"
                  v-model="editForm.username"
                  type="text"
                  class="form-input"
                  placeholder="Enter username"
                />
              </div>
              <div class="form-group">
                <label for="first_name">First Name</label>
                <input
                  id="first_name"
                  v-model="editForm.first_name"
                  type="text"
                  class="form-input"
                  placeholder="Enter first name"
                />
              </div>
              <div class="form-group">
                <label for="last_name">Last Name</label>
                <input
                  id="last_name"
                  v-model="editForm.last_name"
                  type="text"
                  class="form-input"
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div class="form-actions">
              <button class="form-btn cancel-btn" @click="cancelEdit">
                Cancel
              </button>
              <button class="form-btn save-btn" @click="saveEdit">
                <Check :size="18" />
                Save Changes
              </button>
            </div>
          </div>

          <!-- User Info Grid -->
          <div v-else class="info-grid">
            <div class="info-card">
              <label>Email</label>
              <p>{{ user.email }}</p>
            </div>

            <div class="info-card">
              <label>Username</label>
              <p>{{ user.username }}</p>
            </div>

            <div class="info-card">
              <label>Role</label>
              <p>
                <span :class="['role-badge', roleColor(user.role)]">
                  {{ user.role }}
                </span>
              </p>
            </div>

            <div class="info-card">
              <label>First Name</label>
              <p>{{ user.first_name || "-" }}</p>
            </div>

            <div class="info-card">
              <label>Last Name</label>
              <p>{{ user.last_name || "-" }}</p>
            </div>

            <div class="info-card">
              <label>Member Since</label>
              <p>{{ formatDate(user.created_at) }}</p>
            </div>

            <div class="info-card">
              <label>Last Updated</label>
              <p>{{ formatDate(user.updated_at) }}</p>
            </div>

            <div class="info-card">
              <label>User ID</label>
              <p class="font-mono text-sm">
                {{ user.id }}
              </p>
            </div>
          </div>

          <!-- User Projects Section -->
          <div class="projects-section">
            <h2>User Projects ({{ userProjects.length }})</h2>

            <div v-if="isLoadingProjects" class="loading-spinner">
              Loading projects...
            </div>

            <div v-else-if="userProjects.length > 0" class="projects-list">
              <div
                v-for="project in userProjects"
                :key="project.id"
                class="project-item"
                @click="goToProject(project.id)"
              >
                <div class="project-name">
                  <h3>{{ project.title }}</h3>
                </div>
                <div class="project-meta">
                  <span :class="['status-badge', statusColor(project.status)]">
                    {{ project.status }}
                  </span>
                  <span class="date">{{ formatDate(project.createdAt) }}</span>
                </div>
              </div>
            </div>

            <div v-else class="no-projects">
              <p>No projects found for this user</p>
            </div>
          </div>
        </div>

        <!-- No User Found -->
        <div v-else class="no-user">
          <p>User not found</p>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirm"
      class="modal-overlay"
      @click="showDeleteConfirm = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Delete User?</h2>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete
            <strong>{{ user?.username }}</strong>
            ? This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showDeleteConfirm = false">
            Cancel
          </button>
          <button class="delete-confirm-btn" @click="handleDelete">
            Delete
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped lang="scss">
.admin-user-detail-view {
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
  margin-bottom: 20px;
}

.user-detail {
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

  &.edit-user-btn {
    background: #8b5cf6;
    color: white;

    &:hover {
      background: #7c3aed;
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

// Edit Form Styles
.edit-form-section {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;

  h2 {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .form-input {
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.form-btn {
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

  &.cancel-btn {
    background: white;
    color: #666;
    border: 1px solid #e0e0e0;

    &:hover {
      background: #f0f0f0;
    }
  }

  &.save-btn {
    background: #8b5cf6;
    color: white;

    &:hover {
      background: #7c3aed;
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

  .role-badge {
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

// Projects Section
.projects-section {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  margin-top: 32px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
  }
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.project-item {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #8b5cf6;
    background: #faf9fc;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
  }

  .project-name {
    margin-bottom: 12px;

    h3 {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .project-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .date {
      font-size: 12px;
      color: #999;
    }
  }
}

.no-projects {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-user {
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

  .projects-list {
    grid-template-columns: 1fr;
  }
}
</style>
