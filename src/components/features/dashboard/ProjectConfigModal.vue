<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUIStore } from "@/store/ui";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { FileText, Loader2 } from "lucide-vue-next";
import type { ProjectConfig } from "@/types/projects";

const props = defineProps<{
  projectTitle: string;
  sourceFile?: File;
  isEditMode?: boolean;
  existingOcrText?: string;
  existingConfig?: Partial<ProjectConfig>;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "generate", config: ProjectConfig, ocrText: string): void;
}>();

const router = useRouter();
const uiStore = useUIStore();
const { gradientStyle } = useGradientBackground();

// OCR State
const isProcessingOcr = ref(false);
const ocrProgress = ref(0);
const ocrText = ref("");
const isOcrComplete = ref(false);

// Configuration state
const config = ref<ProjectConfig>({
  style: "realistic",
  audioVoice: "female",
  duration: undefined,
  quality: "high",
  effects: [],
});

const isLoading = ref(false);

// Initialize with existing data if in edit mode
onMounted(() => {
  if (props.isEditMode && props.existingOcrText) {
    ocrText.value = props.existingOcrText;
    isOcrComplete.value = true;
  }
  if (props.existingConfig) {
    if (props.existingConfig.style)
      config.value.style = props.existingConfig.style;
    if (props.existingConfig.audioVoice)
      config.value.audioVoice = props.existingConfig.audioVoice;
    if (props.existingConfig.quality)
      config.value.quality = props.existingConfig.quality;
  }
  // Start OCR processing if we have a new file
  if (props.sourceFile && !props.isEditMode) {
    processOcr();
  }
});

// Process OCR (simulated)
const processOcr = async () => {
  isProcessingOcr.value = true;
  ocrProgress.value = 0;

  // Simulate OCR processing with progress
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    ocrProgress.value = (i / steps) * 100;
  }

  // Mock OCR result (will be replaced with actual API call)
  ocrText.value = `Chapter 1: The Beginning

Once upon a time, in a land far away, there lived a young prince who dreamed of adventures beyond the stars. Every night, he would gaze at the sky and wonder about the mysteries of the universe.

The prince lived in a small asteroid, barely bigger than a house. On this asteroid grew a beautiful rose that he cared for with all his heart. But one day, he decided to explore other worlds...

Chapter 2: The Journey

Letting himself be carried by the migratory birds, the little prince began his journey through the cosmos. He visited many strange planets, each inhabited by a single grown-up.

[Text extracted from: ${props.sourceFile?.name || "uploaded file"}]`;

  isProcessingOcr.value = false;
  isOcrComplete.value = true;
};

// Style options based on user-flows.md
const styleOptions = [
  {
    value: "realistic",
    label: "Realistic",
    description: "Photorealistic rendering",
  },
  {
    value: "cartoon",
    label: "Cartoon",
    description: "Western animation style",
  },
  { value: "anime", label: "Manga", description: "Japanese manga style" },
  {
    value: "comic",
    label: "Watercolor",
    description: "Watercolor painting effect",
  },
];

// Audio voice options
const voiceOptions = [
  { value: "female", label: "French", flag: "🇫🇷" },
  { value: "male", label: "English", flag: "🇬🇧" },
  { value: "neutral", label: "Spanish", flag: "🇪🇸" },
];

// Duration options
const durationOptions = [
  { value: "short", label: "Short", time: "2-5 min" },
  { value: "medium", label: "Medium", time: "5-10 min" },
  { value: "long", label: "Long", time: "10-20 min" },
  { value: "auto", label: "Auto", time: "AI calculated" },
];

const selectedDuration = ref<string>("auto");

// Computed
const isFormValid = computed(() => {
  return (
    config.value.style &&
    config.value.audioVoice &&
    isOcrComplete.value &&
    ocrText.value.trim().length > 0
  );
});

// Methods
const handleGenerate = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  try {
    // Map duration selection to actual value
    const durationMap: Record<string, number | undefined> = {
      short: 180,
      medium: 450,
      long: 900,
      auto: undefined,
    };
    config.value.duration = durationMap[selectedDuration.value];

    emit("generate", config.value, ocrText.value);
    uiStore.showSuccess("Project configuration saved! Starting generation...");
  } catch (error: any) {
    uiStore.showError(
      error.message || "Configuration failed. Please try again.",
    );
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  emit("close");
};
</script>

<template>
  <div
    class="config-modal-overlay"
    :style="gradientStyle"
    @click.self="closeModal"
  >
    <div class="config-modal">
      <!-- Logo -->
      <div class="modal-logo">
        <img
          src="/assets/images/short_logo.png"
          alt="VisioBook"
          class="logo-image"
        />
      </div>

      <!-- Title -->
      <h1 class="modal-title">
        {{ isEditMode ? "Edit Your VisioBook" : "Configure Your VisioBook" }}
      </h1>
      <p class="modal-subtitle">{{ projectTitle }}</p>

      <!-- OCR Processing / Text Display -->
      <div class="ocr-section">
        <div class="ocr-header">
          <FileText :size="18" color="#666" />
          <h3 class="section-title">Extracted Text</h3>
        </div>

        <!-- Processing State -->
        <div v-if="isProcessingOcr" class="ocr-processing">
          <div class="processing-content">
            <Loader2 :size="24" color="#a6c3eb" class="spinner" />
            <span class="processing-text"
              >Extracting text from document...</span
            >
          </div>
          <div class="progress-bar-container">
            <div
              class="progress-bar-fill"
              :style="{ width: `${ocrProgress}%` }"
            ></div>
          </div>
          <span class="progress-percent">{{ Math.round(ocrProgress) }}%</span>
        </div>

        <!-- OCR Result -->
        <div v-else class="ocr-result">
          <textarea
            v-model="ocrText"
            class="ocr-textarea"
            placeholder="Extracted text will appear here..."
            :readonly="!isOcrComplete"
          ></textarea>
          <div class="ocr-info">
            <span class="char-count">{{ ocrText.length }} characters</span>
            <span v-if="isOcrComplete" class="edit-hint"
              >You can edit the text if needed</span
            >
          </div>
        </div>
      </div>

      <!-- Configuration Form -->
      <div class="config-form" :class="{ disabled: !isOcrComplete }">
        <!-- Style Selection -->
        <div class="config-section">
          <h3 class="section-title">Visual Style</h3>
          <div class="style-grid">
            <div
              v-for="style in styleOptions"
              :key="style.value"
              class="style-option"
              :class="{ selected: config.style === style.value }"
              @click="config.style = style.value as ProjectConfig['style']"
            >
              <div class="style-preview">
                <div class="style-icon" :class="style.value"></div>
              </div>
              <span class="style-label">{{ style.label }}</span>
            </div>
          </div>
        </div>

        <!-- Language/Voice Selection -->
        <div class="config-section">
          <h3 class="section-title">Audio Language</h3>
          <div class="voice-options">
            <div
              v-for="voice in voiceOptions"
              :key="voice.value"
              class="voice-option"
              :class="{ selected: config.audioVoice === voice.value }"
              @click="
                config.audioVoice = voice.value as ProjectConfig['audioVoice']
              "
            >
              <span class="voice-flag">{{ voice.flag }}</span>
              <span class="voice-label">{{ voice.label }}</span>
            </div>
          </div>
        </div>

        <!-- Duration Selection -->
        <div class="config-section">
          <h3 class="section-title">Animation Duration</h3>
          <div class="duration-options">
            <div
              v-for="duration in durationOptions"
              :key="duration.value"
              class="duration-option"
              :class="{ selected: selectedDuration === duration.value }"
              @click="selectedDuration = duration.value"
            >
              <span class="duration-label">{{ duration.label }}</span>
              <span class="duration-time">{{ duration.time }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="button"
          class="submit-btn"
          :disabled="!isFormValid || isLoading || isProcessingOcr"
          @click="handleGenerate"
        >
          <span v-if="isLoading">Processing...</span>
          <span v-else-if="isProcessingOcr">Extracting Text...</span>
          <span v-else>{{
            isEditMode ? "Save Changes" : "Generate VisioBook"
          }}</span>
        </button>

        <!-- Cancel Link -->
        <div class="cancel-section">
          <a href="#" @click.prevent="closeModal" class="cancel-link">Cancel</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.config-modal-overlay {
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

.config-modal {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px 36px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(255, 255, 255, 0.3);
  animation: slideUp 0.3s ease-out;
  position: relative;

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
  margin-bottom: 24px;
}

.logo-image {
  width: 120px;
  height: auto;
}

.modal-title {
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.modal-subtitle {
  font-size: 14px;
  text-align: center;
  color: #666;
  margin-bottom: 28px;
}

// OCR Section
.ocr-section {
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(245, 245, 245, 0.6);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.ocr-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .section-title {
    margin: 0;
  }
}

.ocr-processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.processing-text {
  font-size: 14px;
  color: #666;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #a6c3eb;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: 12px;
  color: #888;
  font-weight: 500;
}

.ocr-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ocr-textarea {
  width: 100%;
  min-height: 150px;
  max-height: 200px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-family: inherit;
  line-height: 1.5;
  color: #333;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #a6c3eb;
    box-shadow: 0 0 0 2px rgba(166, 195, 235, 0.2);
  }

  &::placeholder {
    color: #999;
  }
}

.ocr-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 11px;
  color: #888;
}

.edit-hint {
  font-size: 11px;
  color: #a6c3eb;
  font-style: italic;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

// Style Selection
.style-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.style-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border-radius: 12px;
  background: rgba(245, 245, 245, 0.6);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(240, 240, 240, 0.8);
  }

  &.selected {
    border-color: #1a1a1a;
    background: rgba(255, 255, 255, 0.9);
  }
}

.style-preview {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
}

.style-icon {
  width: 100%;
  height: 100%;

  &.realistic {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.cartoon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.anime {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.comic {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.style-label {
  font-size: 11px;
  font-weight: 500;
  color: #333;
}

// Voice Options
.voice-options {
  display: flex;
  gap: 12px;
}

.voice-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: rgba(245, 245, 245, 0.6);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(240, 240, 240, 0.8);
  }

  &.selected {
    border-color: #1a1a1a;
    background: rgba(255, 255, 255, 0.9);
  }
}

.voice-flag {
  font-size: 18px;
}

.voice-label {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

// Duration Options
.duration-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.duration-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  background: rgba(245, 245, 245, 0.6);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(240, 240, 240, 0.8);
  }

  &.selected {
    border-color: #1a1a1a;
    background: rgba(255, 255, 255, 0.9);
  }
}

.duration-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.duration-time {
  font-size: 10px;
  color: #888;
}

// Submit Button
.submit-btn {
  width: 100%;
  padding: 14px;
  margin-top: 8px;
  background: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover:not(:disabled) {
    background: rgba(40, 40, 40, 0.95);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Cancel Section
.cancel-section {
  text-align: center;
}

.cancel-link {
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #1a1a1a;
  }
}
</style>
