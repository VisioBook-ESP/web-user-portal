<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { adminApi } from "@/services/api/adminApi";
import { userApi } from "@/services/api/userApi";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import Footer from "@/components/layout/Footer/Footer.vue";
import { Search, Eye, Trash2, X } from "lucide-vue-next";
import type { User } from "@/types";

interface UserWithStats extends User {
  userProjects?: number;
}

const router = useRouter();
const authStore = useAuthStore();
const { gradientStyle } = useGradientBackground();

// State
const users = ref<UserWithStats[]>([]);
const filteredUsers = ref<UserWithStats[]>([]);
const searchQuery = ref("");
const roleFilter = ref<"all" | "user" | "admin">("all");
const isLoading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const totalUsers = ref(0);

// Check admin access
if (!authStore.isAdmin) {
  router.push("/dashboard");
}

// Computed
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / pageSize.value),
);

const roleColor = (role: string) => {
  return role === "admin"
    ? "bg-purple-100 text-purple-800"
    : "bg-blue-100 text-blue-800";
};

// Methods
const loadUsers = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await adminApi.getAllUsers(
      1,
      100,
      searchQuery.value || undefined,
    );

    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      users.value = response;
      totalUsers.value = response.length;
    } else if (response?.data) {
      users.value = response.data;
      totalUsers.value = response.total || response.data.length;
    } else {
      users.value = [];
      totalUsers.value = 0;
    }
    applyFilters();
  } catch (err: any) {
    error.value = err.message || "Failed to load users";
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => {
  let filtered = users.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.first_name && u.first_name.toLowerCase().includes(query)) ||
        (u.last_name && u.last_name.toLowerCase().includes(query)),
    );
  }

  if (roleFilter.value !== "all") {
    filtered = filtered.filter((u) => u.role === roleFilter.value);
  }

  filteredUsers.value = filtered;
  currentPage.value = 1;
};

const handleSearch = () => {
  applyFilters();
};

const goToUserProjects = (userId: number) => {
  router.push(`/admin/users/${userId}/projects`);
};

const goToUserProfile = (userId: number) => {
  router.push({ name: "admin-user-detail", params: { id: userId } });
};

const handleDeleteUser = async (userId: number, username: string) => {
  if (
    confirm(
      `Are you sure you want to delete user "${username}" and all their data? This action cannot be undone.`,
    )
  ) {
    try {
      await userApi.deleteUser(userId);
      await loadUsers();
    } catch (err: any) {
      error.value = err.message || "Failed to delete user";
    }
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="admin-users-view" :style="gradientStyle">
    <Navbar />
    <main class="admin-content">
      <div class="admin-container">
        <div class="admin-header">
          <h1>Admin - Users Management</h1>
          <p class="text-gray-600">Manage all platform users</p>
        </div>

        <!-- Search and Filter Section -->
        <div class="search-filter-section">
          <div class="search-bar">
            <Search :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by username, email, or full name..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>

          <div class="filter-controls">
            <select
              v-model="roleFilter"
              class="role-filter"
              @change="applyFilters"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button class="search-btn" @click="handleSearch">Search</button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-banner">
          <X :size="18" />
          {{ error }}
          <button class="close-error" @click="error = null">
            <X :size="16" />
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-spinner">Loading users...</div>

        <!-- Users Table -->
        <div v-else class="users-table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td class="username">
                  {{ user.username }}
                </td>
                <td class="email">
                  {{ user.email }}
                </td>
                <td class="full-name">
                  {{
                    user.first_name || user.last_name
                      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                      : "-"
                  }}
                </td>
                <td class="role-cell">
                  <span :class="['role-badge', roleColor(user.role)]">
                    {{ user.role }}
                  </span>
                </td>
                <td class="joined-date">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="actions-cell">
                  <button
                    class="action-btn view-btn"
                    title="View Profile"
                    @click="goToUserProfile(user.id)"
                  >
                    <Eye :size="16" />
                  </button>
                  <button
                    v-if="user.id !== authStore.user?.id"
                    class="action-btn delete-btn"
                    title="Delete User"
                    @click="handleDeleteUser(user.id, user.username)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedUsers.length === 0">
                <td colspan="6" class="no-data">No users found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            :disabled="currentPage === 1"
            class="pagination-btn"
            @click="currentPage--"
          >
            Previous
          </button>
          <span class="page-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            @click="currentPage++"
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
.admin-users-view {
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

.role-filter {
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

.users-table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.users-table {
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

.username {
  font-weight: 500;
}

.email {
  color: #666;
  font-size: 13px;
}

.full-name {
  color: #999;
}

.role-cell {
  .role-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
}

.joined-date {
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

  &.delete-btn {
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.1);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
