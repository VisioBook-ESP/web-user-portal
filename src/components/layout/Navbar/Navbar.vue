<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { User, FileSliders } from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();
const showAdminMenu = ref(false);

// Gradient colors for hover effect
const gradientColors = [
  "rgba(255, 255, 255, 0.4)",
  "rgba(254, 245, 234, 0.4)",
  "rgba(231, 246, 255, 0.4)",
  "rgba(227, 237, 248, 0.4)",
  "rgba(250, 245, 255, 0.4)",
  "rgba(255, 237, 250, 0.4)",
];

const generateGradient = () => {
  const shuffledColors = [...gradientColors].sort(() => Math.random() - 0.5);
  const angle = Math.floor(Math.random() * 360);
  return `linear-gradient(${angle}deg, ${shuffledColors.join(", ")})`;
};

const goHome = () => {
  router.push("/");
};

const navigateAdmin = (path: string) => {
  router.push(path);
  showAdminMenu.value = false;
};
</script>

<template>
  <header class="navbar">
    <div class="navbar-container">
      <router-link
        to="/"
        class="logo"
      >
        <img
          src="/assets/images/short_logo.png"
          alt="VisioBook"
          class="logo-icon"
        >
      </router-link>

      <nav class="nav-links">
        <!-- Show Login/Register only when NOT authenticated -->
        <template v-if="!authStore.isAuthenticated">
          <button
            class="nav-btn"
            @click="uiStore.openLoginModal()"
          >
            Login
          </button>
          <button
            class="nav-btn"
            @click="uiStore.openRegisterModal()"
          >
            Register
          </button>
        </template>
        <!-- Authenticated user buttons -->
        <template v-if="authStore.isAuthenticated">
          <button
            class="nav-btn dashboard-btn"
            @click="router.push('/dashboard')"
          >
            My VisioBooks
          </button>
          <!-- Admin Menu -->
          <div
            v-if="authStore.isAdmin"
            class="admin-menu-container"
          >
            <button
              class="nav-btn admin-btn"
              title="Admin Menu"
              @click="showAdminMenu = !showAdminMenu"
            >
              <FileSliders :size="18" />
              <span class="admin-text">Admin menu</span>
            </button>
            <div
              v-if="showAdminMenu"
              class="admin-dropdown"
            >
              <button
                class="admin-menu-item"
                @click="navigateAdmin('/admin/projects')"
              >
                Projects
              </button>
              <button
                class="admin-menu-item"
                @click="navigateAdmin('/admin/users')"
              >
                Users
              </button>
              <button
                class="admin-menu-item"
                @click="navigateAdmin('/admin/monitor')"
              >
                Dashboard
              </button>
            </div>
          </div>
          <div class="profile-container">
            <button
              class="nav-btn profile-btn"
              title="Profile"
              @click="router.push('/profile')"
            >
              <User :size="20" />
            </button>
            <span class="username-text">{{ authStore.user?.username }}</span>
          </div>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 100;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.navbar-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-icon {
  height: 36px; // 50% bigger than 24px
  width: auto;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn {
  background: none;
  border: none;
  padding: 6px 14px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }

  &.dashboard-btn {
    border: 1px solid #1a1a1a;
    border-radius: 4px;
  }

  &.admin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 6px;
    flex-shrink: 0;
    color: #ffffff;
    background: #1a1a1a;

    .admin-text {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
    }

    &:hover {
      color: #1a1a1a;
      background: rgba(128, 128, 128, 0.15);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  &.profile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    flex-shrink: 0;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}

.profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .username-text {
    font-size: 11px;
    font-weight: 500;
    color: #1a1a1a;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 60px;
    line-height: 1;
  }
}

.admin-menu-container {
  position: relative;
  display: flex;
  align-items: center;
}

.admin-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(224, 224, 224, 0.901);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  min-width: 170px;
  z-index: 1000;
  margin-top: 12px;
}

.admin-menu-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(224, 224, 224, 0.663);
  }
}
</style>
