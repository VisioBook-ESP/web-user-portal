<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUIStore } from '@/store/ui';
import { useGradientBackground } from '@/composables/useGradientBackground';
import Navbar from '@/components/layout/Navbar/Navbar.vue';
import ProjectConfigModal from '@/components/features/dashboard/ProjectConfigModal.vue';
import { ChevronLeft } from 'lucide-vue-next';
import type { ProjectConfig } from '@/types/projects';

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();
const { gradientStyle } = useGradientBackground();

// Project state
const projectId = ref(route.params.id as string);
const isLoading = ref(true);
const showConfigModal = ref(false);

// Mock project data (will be replaced with API call)
const project = ref({
  id: '',
  title: '',
  ocrText: '',
  config: {
    style: 'realistic' as const,
    audioVoice: 'female' as const,
    quality: 'high' as const,
  },
  thumbnailUrl: '/assets/images/Projectimage.png',
});

// Load project data
onMounted(async () => {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data
    project.value = {
      id: projectId.value,
      title: 'The Little Prince',
      ocrText: `Chapter 1: The Beginning

Once upon a time, in a land far away, there lived a young prince who dreamed of adventures beyond the stars. Every night, he would gaze at the sky and wonder about the mysteries of the universe.

The prince lived in a small asteroid, barely bigger than a house. On this asteroid grew a beautiful rose that he cared for with all his heart. But one day, he decided to explore other worlds...

Chapter 2: The Journey

Letting himself be carried by the migratory birds, the little prince began his journey through the cosmos. He visited many strange planets, each inhabited by a single grown-up.`,
      config: {
        style: 'realistic',
        audioVoice: 'female',
        quality: 'high',
      },
      thumbnailUrl: '/assets/images/Projectimage.png',
    };
    
    isLoading.value = false;
    showConfigModal.value = true;
  } catch (error: any) {
    uiStore.showError('Failed to load project');
    router.push('/dashboard');
  }
});

// Handle save
const handleSave = (config: ProjectConfig, ocrText: string) => {
  showConfigModal.value = false;
  uiStore.showInfo('Saving changes...');
  
  // TODO: Call API to update project
  console.log('Saving project with config:', config);
  console.log('OCR text:', ocrText);
  
  // Redirect back to player
  setTimeout(() => {
    uiStore.showSuccess('Project updated successfully!');
    router.push(`/projects/${projectId.value}/player`);
  }, 1000);
};

// Handle close/cancel
const handleClose = () => {
  showConfigModal.value = false;
  router.back();
};

// Navigate back
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="edit-view" :style="gradientStyle">
    <!-- Navigation Bar -->
    <Navbar />

    <div class="edit-container">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading project...</p>
      </div>

      <!-- Project Configuration Modal -->
      <ProjectConfigModal
        v-if="showConfigModal && !isLoading"
        :project-title="project.title"
        :is-edit-mode="true"
        :existing-ocr-text="project.ocrText"
        :existing-config="project.config"
        @close="handleClose"
        @generate="handleSave"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.edit-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 70px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(166, 195, 235, 0.3);
  border-top-color: #a6c3eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
