<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { useUIStore } from "@/store/ui";
import { useAuthStore } from "@/store/auth";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import {
  User,
  Lock,
  Crown,
  Camera,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-vue-next";

const router = useRouter();
const uiStore = useUIStore();
const authStore = useAuthStore();
const { gradientStyle } = useGradientBackground();

// Active section
const activeSection = ref<"profile" | "password" | "premium" | "notifications">(
  "profile",
);

// Form states
const isEditing = ref(false);
const isSaving = ref(false);

// Profile form — kept in sync with the store's user on mount / after save
const profileForm = ref({
  first_name: "",
  last_name: "",
  username: "",
});

const syncFormFromStore = () => {
  const u = authStore.user;
  if (!u) return;
  profileForm.value = {
    first_name: u.first_name ?? "",
    last_name: u.last_name ?? "",
    username: u.username,
  };
};

onMounted(() => syncFormFromStore());

// Password form
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Notification settings (local only — no backend endpoint yet)
const notificationSettings = ref({
  emailNotifications: true,
  projectUpdates: true,
  marketingEmails: false,
  securityAlerts: true,
});

// Computed
const userInitials = computed(() => authStore.userInitials);

const memberSince = computed(() => {
  const raw = authStore.user?.created_at;
  if (!raw) return "";
  return new Date(raw).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
});

const isPasswordValid = computed(() => {
  return (
    passwordForm.value.currentPassword.length >= 1 &&
    passwordForm.value.newPassword.length >= 8 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  );
});

// Methods
const goBack = () => {
  router.back();
};

const startEditing = () => {
  syncFormFromStore();
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const saveProfile = async () => {
  isSaving.value = true;
  try {
    await authStore.updateProfile({
      username: profileForm.value.username || undefined,
      first_name: profileForm.value.first_name || undefined,
      last_name: profileForm.value.last_name || undefined,
    });
    // Fetch fresh profile data to ensure all fields including first_name and last_name are displayed
    await authStore.fetchProfile();
    // Sync form from the updated store
    syncFormFromStore();
    isEditing.value = false;
    uiStore.showSuccess("Profile updated successfully!");
  } catch {
    uiStore.showError("Failed to update profile");
  } finally {
    isSaving.value = false;
  }
};

const changePassword = async () => {
  if (!isPasswordValid.value) return;
  isSaving.value = true;
  try {
    // No dedicated change-password endpoint yet in core-user-service.
    // Inform user and reset the form as a no-op for now.
    uiStore.showInfo("Password change is not yet supported by the backend.");
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  } finally {
    isSaving.value = false;
  }
};

const upgradeToPremium = () => {
  uiStore.showInfo("Redirecting to payment...");
};

const saveNotifications = async () => {
  isSaving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 300));
    uiStore.showSuccess("Notification settings saved!");
  } finally {
    isSaving.value = false;
  }
};

const logout = () => {
  authStore.logout();
  router.push("/");
};

const uploadAvatar = () => {
  uiStore.showInfo("Avatar upload coming soon!");
};
</script>

<template>
  <div class="profile-view" :style="gradientStyle">
    <!-- Navigation Bar -->
    <Navbar />

    <div class="profile-container">
      <!-- Back Button -->
      <button class="back-button" @click="goBack">
        <ChevronLeft :size="24" color="#1a1a1a" />
        <span>Back</span>
      </button>

      <!-- Profile Modal -->
      <div class="profile-modal">
        <!-- Logo -->
        <div class="modal-logo">
          <img
            src="/assets/images/short_logo.png"
            alt="VisioBook"
            class="logo-image"
          />
        </div>

        <!-- User Avatar & Info -->
        <div class="user-header">
          <div class="avatar-container" @click="uploadAvatar">
            <div class="avatar-placeholder">
              {{ userInitials }}
            </div>
            <div class="avatar-overlay">
              <Camera :size="20" color="#fff" />
            </div>
          </div>
          <div class="user-info">
            <h2 class="user-name">
              {{ authStore.displayName || authStore.user?.username }}
            </h2>
            <p class="user-email">{{ authStore.user?.email }}</p>
            <p
              class="user-profile-details"
              v-if="authStore.user?.first_name || authStore.user?.last_name"
            >
              {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}
            </p>
            <div class="user-badges">
              <span class="badge free">Free Plan</span>
              <span class="badge member">Member since {{ memberSince }}</span>
            </div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="section-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeSection === 'profile' }"
            @click="activeSection = 'profile'"
          >
            <User :size="16" />
            Profile
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeSection === 'password' }"
            @click="activeSection = 'password'"
          >
            <Lock :size="16" />
            Password
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeSection === 'premium' }"
            @click="activeSection = 'premium'"
          >
            <Crown :size="16" />
            Premium
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeSection === 'notifications' }"
            @click="activeSection = 'notifications'"
          >
            <Bell :size="16" />
            Alerts
          </button>
        </div>

        <!-- Profile Section -->
        <div v-if="activeSection === 'profile'" class="section-content">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input
              v-model="profileForm.first_name"
              type="text"
              class="form-input"
              :disabled="!isEditing"
              placeholder="Enter first name"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input
              v-model="profileForm.last_name"
              type="text"
              class="form-input"
              :disabled="!isEditing"
              placeholder="Enter last name"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Username</label>
            <input
              v-model="profileForm.username"
              type="text"
              class="form-input"
              :disabled="!isEditing"
              placeholder="Enter username"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              :value="authStore.user?.email"
              type="email"
              class="form-input"
              disabled
              placeholder="Email cannot be changed here"
            />
          </div>

          <div class="form-actions">
            <button v-if="!isEditing" class="btn-primary" @click="startEditing">
              Edit Profile
            </button>
            <template v-else>
              <button
                class="btn-secondary"
                @click="cancelEditing"
                :disabled="isSaving"
              >
                Cancel
              </button>
              <button
                class="btn-primary"
                @click="saveProfile"
                :disabled="isSaving"
              >
                {{ isSaving ? "Saving..." : "Save Changes" }}
              </button>
            </template>
          </div>
        </div>

        <!-- Password Section -->
        <div v-if="activeSection === 'password'" class="section-content">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <div class="input-with-icon">
              <input
                v-model="passwordForm.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter current password"
              />
              <button
                class="icon-toggle"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <Eye v-if="!showCurrentPassword" :size="18" color="#888" />
                <EyeOff v-else :size="18" color="#888" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <div class="input-with-icon">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter new password (min 8 characters)"
              />
              <button
                class="icon-toggle"
                @click="showNewPassword = !showNewPassword"
              >
                <Eye v-if="!showNewPassword" :size="18" color="#888" />
                <EyeOff v-else :size="18" color="#888" />
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <div class="input-with-icon">
              <input
                v-model="passwordForm.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Confirm new password"
              />
              <button
                class="icon-toggle"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <Eye v-if="!showConfirmPassword" :size="18" color="#888" />
                <EyeOff v-else :size="18" color="#888" />
              </button>
            </div>
            <span
              v-if="
                passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword
              "
              class="error-text"
            >
              Passwords don't match
            </span>
          </div>

          <div class="form-actions">
            <button
              class="btn-primary"
              @click="changePassword"
              :disabled="!isPasswordValid || isSaving"
            >
              {{ isSaving ? "Changing..." : "Change Password" }}
            </button>
          </div>
        </div>

        <!-- Premium Section -->
        <div v-if="activeSection === 'premium'" class="section-content">
          <div v-if="false" class="premium-status active">
            <Crown :size="32" color="#a6c3eb" />
            <h3>You're a Premium Member!</h3>
            <p>
              Enjoy unlimited VisioBooks, priority processing, and exclusive
              features.
            </p>
            <div class="premium-features">
              <div class="feature-item">
                <Check :size="16" color="#4CAF50" /> Unlimited VisioBooks
              </div>
              <div class="feature-item">
                <Check :size="16" color="#4CAF50" /> Priority Processing
              </div>
              <div class="feature-item">
                <Check :size="16" color="#4CAF50" /> 4K Video Export
              </div>
              <div class="feature-item">
                <Check :size="16" color="#4CAF50" /> No Watermarks
              </div>
              <div class="feature-item">
                <Check :size="16" color="#4CAF50" /> Premium Support
              </div>
            </div>
          </div>

          <div v-else class="premium-upgrade">
            <div class="upgrade-header">
              <Crown :size="40" color="#a6c3eb" />
              <h3>Upgrade to Premium</h3>
              <p>Unlock the full potential of VisioBook</p>
            </div>

            <div class="pricing-card">
              <div class="price">
                <span class="amount">€9.99</span>
                <span class="period">/month</span>
              </div>
              <div class="features-list">
                <div class="feature-item">
                  <Check :size="16" color="#4CAF50" /> Unlimited VisioBooks
                </div>
                <div class="feature-item">
                  <Check :size="16" color="#4CAF50" /> Priority Processing
                </div>
                <div class="feature-item">
                  <Check :size="16" color="#4CAF50" /> 4K Video Export
                </div>
                <div class="feature-item">
                  <Check :size="16" color="#4CAF50" /> No Watermarks
                </div>
                <div class="feature-item">
                  <Check :size="16" color="#4CAF50" /> Premium Support
                </div>
              </div>
              <button class="btn-premium" @click="upgradeToPremium">
                <CreditCard :size="18" />
                Upgrade Now
              </button>
            </div>
          </div>
        </div>

        <!-- Notifications Section -->
        <div v-if="activeSection === 'notifications'" class="section-content">
          <div class="toggle-group">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Email Notifications</span>
                <span class="toggle-description"
                  >Receive email updates about your projects</span
                >
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="notificationSettings.emailNotifications"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Project Updates</span>
                <span class="toggle-description"
                  >Get notified when your VisioBooks are ready</span
                >
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="notificationSettings.projectUpdates"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Marketing Emails</span>
                <span class="toggle-description"
                  >Receive news, tips, and special offers</span
                >
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="notificationSettings.marketingEmails"
                />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Security Alerts</span>
                <span class="toggle-description"
                  >Important security notifications</span
                >
              </div>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  v-model="notificationSettings.securityAlerts"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button
              class="btn-primary"
              @click="saveNotifications"
              :disabled="isSaving"
            >
              {{ isSaving ? "Saving..." : "Save Settings" }}
            </button>
          </div>
        </div>

        <!-- Logout Button -->
        <div class="logout-section">
          <button class="btn-logout" @click="logout">
            <LogOut :size="18" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.profile-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 24px 40px;
  position: relative;
}

.back-button {
  position: absolute;
  top: 90px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  padding: 8px 16px 8px 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
  }
}

.profile-modal {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 520px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-image {
  width: 80px;
  height: auto;
}

// User Header
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  cursor: pointer;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.avatar-image,
.avatar-placeholder {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #a6c3eb, #8ab3de);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.user-email {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px;
}

.user-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;

  &.premium {
    background: linear-gradient(135deg, #a6c3eb, #8ab3de);
    color: #fff;
  }

  &.free {
    background: rgba(0, 0, 0, 0.08);
    color: #666;
  }

  &.member {
    background: rgba(0, 0, 0, 0.05);
    color: #888;
  }
}

// Section Tabs
.section-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 4px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #1a1a1a;
  }

  &.active {
    background: #fff;
    color: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

// Section Content
.section-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// Form Groups
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 12px 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 14px;
  color: #1a1a1a;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #a6c3eb;
    box-shadow: 0 0 0 3px rgba(166, 195, 235, 0.2);
  }

  &:disabled {
    background: rgba(0, 0, 0, 0.03);
    color: #666;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #999;
  }
}

.input-with-icon {
  position: relative;

  .form-input {
    padding-right: 44px;
  }
}

.icon-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.error-text {
  font-size: 11px;
  color: #e53935;
}

// Form Actions
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-primary {
  flex: 1;
  padding: 12px 20px;
  background: rgba(26, 26, 26, 0.9);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(40, 40, 40, 0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-secondary {
  padding: 12px 20px;
  background: transparent;
  color: #666;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }
}

// Premium Section
.premium-status,
.premium-upgrade {
  text-align: center;
  padding: 20px 0;
}

.premium-status {
  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 12px 0 8px;
  }

  p {
    font-size: 13px;
    color: #666;
    margin: 0 0 20px;
  }
}

.upgrade-header {
  margin-bottom: 24px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 12px 0 8px;
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.pricing-card {
  background: rgba(166, 195, 235, 0.1);
  border: 1px solid rgba(166, 195, 235, 0.3);
  border-radius: 16px;
  padding: 24px;
}

.price {
  margin-bottom: 20px;

  .amount {
    font-size: 36px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .period {
    font-size: 14px;
    color: #666;
  }
}

.features-list,
.premium-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}

.btn-premium {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #a6c3eb, #8ab3de);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(166, 195, 235, 0.4);
  }
}

// Toggle Groups
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);

  &:last-child {
    border-bottom: none;
  }
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
}

.toggle-description {
  font-size: 12px;
  color: #888;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 24px;
    transition: 0.3s;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  input:checked + .slider {
    background: #a6c3eb;
  }

  input:checked + .slider:before {
    transform: translateX(20px);
  }
}

// Logout Section
.logout-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: transparent;
  color: #e53935;
  border: 1px solid rgba(229, 57, 53, 0.3);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(229, 57, 53, 0.1);
    border-color: rgba(229, 57, 53, 0.5);
  }
}

// Responsive
@media (max-width: 600px) {
  .profile-container {
    padding: 90px 16px 24px;
  }

  .profile-modal {
    padding: 24px 20px;
  }

  .user-header {
    flex-direction: column;
    text-align: center;
  }

  .user-badges {
    justify-content: center;
  }

  .section-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    font-size: 11px;
    padding: 8px 10px;
  }
}
</style>
