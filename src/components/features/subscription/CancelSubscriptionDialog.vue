<!-- src/components/features/subscription/CancelSubscriptionDialog.vue -->
<template>
  <div class="dialog-overlay" @click.self="$emit('close')">
    <div class="dialog-content">
      <div class="dialog-header">
        <h2 class="dialog-title">Cancel Subscription</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="dialog-body">
        <p class="warning-text">
          ⚠️ Are you sure you want to cancel your subscription? You'll lose
          access to premium features and be downgraded to the free plan at the
          end of your current billing period.
        </p>

        <div class="cancellation-info">
          <h4>What happens when you cancel:</h4>
          <ul>
            <li>
              Your subscription will be canceled at the end of the current
              billing cycle
            </li>
            <li>You'll keep your account and all your projects</li>
            <li>You can upgrade back to a paid plan anytime</li>
            <li>Your quota will be reset to the free plan limits</li>
          </ul>
        </div>

        <div class="form-group">
          <label for="reason" class="form-label"
            >Reason for cancellation (optional):</label
          >
          <textarea
            id="reason"
            v-model="cancellationReason"
            class="form-textarea"
            placeholder="Tell us why you're leaving..."
            rows="4"
          />
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          Keep Subscription
        </button>
        <button
          class="btn btn-danger"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          <span v-if="loading">Canceling...</span>
          <span v-else>Confirm Cancellation</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  loading: boolean;
}>();

defineEmits<{
  confirm: [];
  close: [];
}>();

const cancellationReason = ref("");
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
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

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #f5f5f5;
  color: #333;
}

.dialog-body {
  padding: 24px;
}

.warning-text {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  padding: 12px 16px;
  margin: 0 0 20px 0;
  color: #856404;
  font-size: 14px;
  line-height: 1.5;
}

.cancellation-info {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
}

.cancellation-info h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.cancellation-info ul {
  margin: 0;
  padding-left: 20px;
  list-style: disc;
  color: #666;
  font-size: 13px;
  line-height: 1.6;
}

.cancellation-info li {
  margin-bottom: 8px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-family: inherit;
  font-size: 13px;
  resize: vertical;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.dialog-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #d0d0d0;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.btn-danger {
  background-color: #f44336;
  color: white;
  border: 1px solid #f44336;
}

.btn-danger:hover:not(:disabled) {
  background-color: #da190b;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
