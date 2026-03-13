<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { User } from 'lucide-vue-next';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();

const goHome = () => {
  router.push('/');
};
</script>

<template>
  <header class="navbar">
    <div class="navbar-container">
      <router-link to="/" class="logo">
        <img src="/assets/images/short_logo.png" alt="VisioBook" class="logo-icon" />
      </router-link>

      <nav class="nav-links">
        <!-- Always show Login/Register for development testing -->
        <button class="nav-btn" @click="uiStore.openLoginModal()">Login</button>
        <button class="nav-btn" @click="uiStore.openRegisterModal()">Register</button>
        <!-- Authenticated user buttons -->
        <template v-if="authStore.isAuthenticated">
          <button class="nav-btn primary" @click="router.push('/dashboard')">Dashboard</button>
          <button class="nav-btn profile-btn" @click="router.push('/profile')" title="Profile">
            <User :size="20" />
          </button>
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
  padding: 12px 0;
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
  gap: 8px;
}

.nav-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: #666;
  }

  &.primary {
    background: #1a1a1a;
    color: white;
    border-radius: 4px;

    &:hover {
      background: #333;
    }
  }

  &.profile-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;
    
    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
