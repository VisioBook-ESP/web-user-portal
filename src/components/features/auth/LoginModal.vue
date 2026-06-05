<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { useGradientBackground } from "@/composables/useGradientBackground";
import * as yup from "yup";

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { gradientStyle } = useGradientBackground();

// Form state
const form = ref({
  email: "",
  password: "",
});

const isLoading = ref(false);
const acceptTerms = ref(false);
const errors = ref<Record<string, string>>({});

// Validation schema
const loginSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

// Computed
const isFormValid = computed(() => {
  return (
    form.value.email &&
    form.value.password &&
    acceptTerms.value &&
    Object.keys(errors.value).length === 0
  );
});

// Methods
const validateField = async (field: keyof typeof form.value) => {
  try {
    await loginSchema.validateAt(field, form.value);
    delete errors.value[field];
  } catch (err: any) {
    errors.value[field] = err.message;
  }
};

const validateForm = async (): Promise<boolean> => {
  try {
    await loginSchema.validate(form.value, { abortEarly: false });
    errors.value = {};
    return true;
  } catch (err: any) {
    const validationErrors: Record<string, string> = {};
    err.inner.forEach((error: any) => {
      validationErrors[error.path] = error.message;
    });
    errors.value = validationErrors;
    return false;
  }
};

const handleSubmit = async () => {
  const isValid = await validateForm();
  if (!isValid || !acceptTerms.value) return;

  isLoading.value = true;

  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
      rememberMe: true,
    });

    uiStore.showSuccess("Welcome back!");
    uiStore.closeAuthModal();
    router.push("/dashboard");
  } catch (error: any) {
    uiStore.showError(error.message || "Login failed. Please try again.");
  } finally {
    isLoading.value = false;
  }
};

const switchToRegister = () => {
  uiStore.switchAuthModal();
};

const closeModal = () => {
  uiStore.closeAuthModal();
};
</script>

<template>
  <div
    class="auth-modal-overlay"
    :style="gradientStyle"
    @click.self="closeModal"
  >
    <div class="auth-modal">
      <!-- Logo -->
      <div class="modal-logo">
        <img
          src="/assets/images/short_logo.png"
          alt="VisioBook"
          class="logo-image"
        />
      </div>

      <!-- Title -->
      <h1 class="modal-title">Login</h1>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <input
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            class="auth-input"
            :class="{ 'has-error': errors.email }"
            @blur="validateField('email')"
          />
          <span v-if="errors.email" class="error-message">{{
            errors.email
          }}</span>
        </div>

        <div class="input-group">
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            class="auth-input"
            :class="{ 'has-error': errors.password }"
            @blur="validateField('password')"
          />
          <span v-if="errors.password" class="error-message">{{
            errors.password
          }}</span>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Log In</span>
        </button>

        <!-- Terms Agreement -->
        <div class="terms-agreement">
          <label class="checkbox-container">
            <input v-model="acceptTerms" type="checkbox" />
            <span class="checkmark" />
          </label>
          <span class="terms-text">
            I Agree to the <a href="#" class="terms-link">Privacy Policy</a> and
            <a href="#" class="terms-link">Terms of Service</a>
          </span>
        </div>
      </form>

      <!-- Switch to Register -->
      <div class="switch-auth">
        <span>You do not have an account?</span>
        <a href="#" class="switch-link" @click.prevent="switchToRegister"
          >Create an account</a
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.auth-modal {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 380px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  animation: slideUp 0.3s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.8),
      transparent
    );
  }
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
  margin-bottom: 32px;
}

.logo-image {
  width: 160px;
  height: auto;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 32px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.auth-input {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid rgba(224, 224, 224, 0.8);
  font-size: 14px;
  color: #1a1a1a;
  background: transparent;
  transition: all 0.2s;

  &::placeholder {
    color: rgba(158, 158, 158, 0.9);
  }

  &:focus {
    outline: none;
    border-bottom-color: #1a1a1a;
  }

  &.has-error {
    border-bottom-color: #f44336;
  }
}

.error-message {
  font-size: 12px;
  color: #f44336;
  margin-top: 4px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 16px;
  background: rgba(232, 232, 232, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover:not(:disabled) {
    background: rgba(208, 208, 208, 0.8);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.terms-agreement {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
}

.checkbox-container {
  position: relative;
  width: 18px;
  height: 18px;
  flex-shrink: 0;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 18px;
    width: 18px;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 50%;
    transition: all 0.2s;
  }

  input:checked ~ .checkmark {
    background-color: #4caf50;
    border-color: #4caf50;
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 6px;
    top: 3px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  input:checked ~ .checkmark:after {
    display: block;
  }
}

.terms-text {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.terms-link {
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.switch-auth {
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: #666;

  .switch-link {
    color: #1a1a1a;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
