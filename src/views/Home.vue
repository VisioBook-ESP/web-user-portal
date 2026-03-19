<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import Navbar from '@/components/layout/Navbar/Navbar.vue';
import Footer from '@/components/layout/Footer/Footer.vue';
import ProjectConfigModal from '@/components/features/dashboard/ProjectConfigModal.vue';
import { Upload, ScanText } from 'lucide-vue-next';
import { useGradientBackground } from '@/composables/useGradientBackground';
import type { ProjectConfig } from '@/types/projects';

const router = useRouter();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { gradientStyle } = useGradientBackground();

// Upload state
const uploadedFile = ref<File | null>(null);
const projectTitle = ref('');
const showConfigModal = ref(false);
const isDragging = ref(false);

// Computed
const hasUploadedFile = computed(() => uploadedFile.value !== null);

// File upload methods
const handleFileInputClick = (event: Event) => {
  if (!authStore.isAuthenticated) {
    event.preventDefault();
    uiStore.openLoginModal();
    return;
  }
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    processFile(input.files[0]);
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const processFile = (file: File) => {
  // Check if file is PDF
  if (file.type !== 'application/pdf') {
    uiStore.showError('Please upload a PDF file');
    return;
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    uiStore.showError('File size must be less than 50MB');
    return;
  }

  uploadedFile.value = file;
  // Extract title from filename (remove extension)
  projectTitle.value = file.name.replace(/\.pdf$/i, '');
  uiStore.showSuccess(`File "${file.name}" uploaded successfully`);
  
  // Automatically open the config modal
  showConfigModal.value = true;
};

const handleGenerate = (config: ProjectConfig, ocrText: string) => {
  showConfigModal.value = false;
  uiStore.showInfo('Starting VisioBook generation...');
  
  // TODO: Call API to create project and start workflow
  console.log('Config:', config);
  console.log('OCR Text:', ocrText);
  
  // Redirect to dashboard or project detail
  router.push('/dashboard');
};

const handleModalClose = () => {
  showConfigModal.value = false;
  uploadedFile.value = null;
  projectTitle.value = '';
};

// Scanner (disabled for now)
const openScanner = () => {
  if (!authStore.isAuthenticated) {
    uiStore.openLoginModal();
    return;
  }
  uiStore.showInfo('Scanner feature coming soon!');
};

const features = [
  {
    title: 'Upload a text',
    description: 'Upload a PDF file and let VisioBook do the rest. We\'ll extract the content, analyze it, and generate a beautiful visual book for you.',
  },
  {
    title: 'Or scan a text',
    description: 'Have a physical book or document? Use our scanning feature to capture it with your phone\'s camera. We\'ll process the images and turn them into a digital VisioBook.',
  },
  {
    title: 'Enjoy',
    description: ' Once your VisioBook is ready, you can view it online and share it with friends. It\'s the perfect way to bring your texts to life!',
  },
];
</script>

<template>
  <div class="home-view" :style="gradientStyle">
    <!-- Navigation Bar -->
    <Navbar />

    <!-- Hero Section -->
    <main class="main-content">
      <section class="hero-section">
        <div class="brand-logo">
          <img src="/assets/images/logo.png" alt="VISIOBOOK" class="hero-logo" />
        </div>

        <!-- Action Icons -->
        <div class="action-icons">
          <div 
            class="action-icon"
            :class="{ 'dragging': isDragging }"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <input
              type="file"
              id="home-file-upload"
              accept=".pdf"
              class="file-input"
              @click="handleFileInputClick"
              @change="handleFileSelect"
            />
            <label for="home-file-upload" class="action-icon-label">
              <Upload :size="128" color="#1a1a1a" :stroke-width="1.5" />
            </label>
          </div>
          <div class="action-icon" @click="openScanner">
            <ScanText :size="128" color="#1a1a1a" :stroke-width="1.5" />
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <div class="features-container">
          <div 
            v-for="(feature, index) in features" 
            :key="index" 
            class="feature-card"
          >
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Project Configuration Modal -->
    <ProjectConfigModal
      v-if="showConfigModal"
      :project-title="projectTitle"
      :source-file="uploadedFile || undefined"
      @close="handleModalClose"
      @generate="handleGenerate"
    />
  </div>
</template>

<style scoped lang="scss">
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

// Main Content
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
}

// Hero Section
.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
}

.brand-logo {
  margin-bottom: -70px;
}

.hero-logo {
  max-width: clamp(360px, 60vw, 720px);
  height: auto;
}

.action-icons {
  display: flex;
  gap: 48px;
  margin-top: 0;
}

.action-icon {
  width: 128px;
  height: 128px;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }

  &.dragging {
    transform: scale(1.15);
    
    svg {
      color: #4CAF50 !important;
    }
  }

  svg {
    width: 100%;
    height: 100%;
  }
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.action-icon-label {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

// Features Section
.features-section {
  padding: 48px 24px 80px;
  border-top: 1px solid #e8e8e8;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}

.feature-card {
  padding: 24px 0;
  border-right: 1px solid #e8e8e8;

  &:last-child {
    border-right: none;
  }

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #e8e8e8;
    padding: 24px;

    &:last-child {
      border-bottom: none;
    }
  }
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.feature-description {
  font-size: 13px;
  color: #888;
  line-height: 1.6;
  max-width: 280px;
}
</style>
