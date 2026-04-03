<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUIStore } from "@/store/ui";
import { useGradientBackground } from "@/composables/useGradientBackground";
import api from "@/services/api";
import * as yup from "yup";

const router = useRouter();
const uiStore = useUIStore();
const { gradientStyle } = useGradientBackground();

const email = ref("");
const isLoading = ref(false);
const emailSent = ref(false);
const error = ref("");

const emailSchema = yup
  .string()
  .email("Invalid email address")
  .required("Email is required");

const validateEmail = async () => {
  try {
    await emailSchema.validate(email.value);
    error.value = "";
    return true;
  } catch (err: any) {
    error.value = err.message;
    return false;
  }
};

const handleSubmit = async () => {
  const isValid = await validateEmail();
  if (!isValid) return;

  isLoading.value = true;

  try {
    await api.post("/auth/forgot-password", { email: email.value });
    emailSent.value = true;
    uiStore.showSuccess("Password reset email sent! Check your inbox.");
  } catch (err: any) {
    uiStore.showError(
      err.message || "Failed to send reset email. Please try again.",
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="forgot-password-view"
    :style="gradientStyle"
  >
    <v-container
      fluid
      class="fill-height"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          sm="8"
          md="6"
          lg="4"
        >
          <v-card
            elevation="8"
            rounded="xl"
            class="forgot-password-card"
          >
            <!-- Logo and Title -->
            <v-card-title class="text-center py-6">
              <div class="d-flex flex-column align-center">
                <v-icon
                  :color="emailSent ? 'success' : 'primary'"
                  size="48"
                  class="mb-2"
                >
                  {{ emailSent ? "mdi-email-check" : "mdi-lock-reset" }}
                </v-icon>
                <h1 class="text-h4 font-weight-bold text-primary">
                  {{ emailSent ? "Check Your Email" : "Forgot Password?" }}
                </h1>
                <p class="text-subtitle-1 text-grey-darken-1 mt-2">
                  {{
                    emailSent
                      ? "We sent you a reset link"
                      : "No worries, we'll send you reset instructions"
                  }}
                </p>
              </div>
            </v-card-title>

            <v-card-text class="px-6 pb-6">
              <template v-if="!emailSent">
                <v-form @submit.prevent="handleSubmit">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :error-messages="error"
                    class="mb-4"
                    @blur="validateEmail"
                    @input="validateEmail"
                  />

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="isLoading"
                    class="mb-4"
                  >
                    Send Reset Link
                  </v-btn>

                  <div class="text-center">
                    <v-btn
                      variant="text"
                      color="primary"
                      @click="router.push('/login')"
                    >
                      <v-icon start>
                        mdi-arrow-left
                      </v-icon>
                      Back to Login
                    </v-btn>
                  </div>
                </v-form>
              </template>

              <template v-else>
                <v-alert
                  type="success"
                  variant="tonal"
                  class="mb-4"
                >
                  We've sent a password reset link to
                  <strong>{{ email }}</strong>
                </v-alert>

                <p class="text-body-2 text-grey-darken-1 mb-4">
                  Didn't receive the email? Check your spam folder or
                </p>

                <v-btn
                  variant="outlined"
                  color="primary"
                  block
                  class="mb-4"
                  @click="emailSent = false"
                >
                  Try Another Email
                </v-btn>

                <div class="text-center">
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="router.push('/login')"
                  >
                    <v-icon start>
                      mdi-arrow-left
                    </v-icon>
                    Back to Login
                  </v-btn>
                </div>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped lang="scss">
.forgot-password-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.forgot-password-card {
  background: white;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
