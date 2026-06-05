<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUIStore } from "@/store/ui";
import { useGradientBackground } from "@/composables/useGradientBackground";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import Footer from "@/components/layout/Footer/Footer.vue";
import ProjectConfigModal from "@/components/features/dashboard/ProjectConfigModal.vue";
import {
  Upload,
  ScanText,
  Play,
  Pencil,
  Trash2,
  Share2,
} from "lucide-vue-next";
import type { ProjectConfig } from "@/types/projects";

// Extended project type with scene images for mosaic display
interface ProjectWithScenes {
  id: string;
  userId: string;
  title: string;
  status: "draft" | "processing" | "completed" | "failed";
  sceneImages: string[]; // 4 images for mosaic
  createdAt: string;
}

const router = useRouter();
const uiStore = useUIStore();
const { gradientStyle } = useGradientBackground();

// State
const uploadedFile = ref<File | null>(null);
const projectTitle = ref("");
const showConfigModal = ref(false);
const isDragging = ref(false);

// Mock projects with scene images for mosaic display (will be replaced with API call)
const myProjects = ref<ProjectWithScenes[]>([
  {
    id: "1",
    userId: "user-1",
    title: "The Little Prince",
    status: "completed",
    sceneImages: [
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
    ],
    createdAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "2",
    userId: "user-1",
    title: "Adventure Story",
    status: "completed",
    sceneImages: [
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
    ],
    createdAt: "2026-02-28T10:00:00Z",
  },
  {
    id: "3",
    userId: "user-1",
    title: "Fairy Tale",
    status: "completed",
    sceneImages: [
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
    ],
    createdAt: "2026-02-27T10:00:00Z",
  },
  {
    id: "4",
    userId: "user-1",
    title: "Science Fiction",
    status: "completed",
    sceneImages: [
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
    ],
    createdAt: "2026-02-26T10:00:00Z",
  },
  {
    id: "5",
    userId: "user-1",
    title: "Mystery Novel",
    status: "completed",
    sceneImages: [
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
      "/assets/images/Projectimage.png",
    ],
    createdAt: "2026-02-25T10:00:00Z",
  },
]);

// Computed
const hasUploadedFile = computed(() => uploadedFile.value !== null);

// File upload methods
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
  if (file.type !== "application/pdf") {
    uiStore.showError("Please upload a PDF file");
    return;
  }

  // Check file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    uiStore.showError("File size must be less than 50MB");
    return;
  }

  uploadedFile.value = file;
  // Extract title from filename (remove extension)
  projectTitle.value = file.name.replace(/\.pdf$/i, "");
  uiStore.showSuccess(`File "${file.name}" uploaded successfully`);
};

const clearUpload = () => {
  uploadedFile.value = null;
  projectTitle.value = "";
};

const openConfigModal = () => {
  if (!uploadedFile.value) return;
  showConfigModal.value = true;
};

const handleGenerate = (config: ProjectConfig, ocrText: string) => {
  showConfigModal.value = false;
  uiStore.showInfo("Starting VisioBook generation...");

  // TODO: Call API to create project and start workflow
  // Debug info available in config and ocrText

  // For now, redirect to a mock project detail
  router.push("/projects/new");
};

// Scanner (disabled for now)
const openScanner = () => {
  uiStore.showInfo("Scanner feature coming soon!");
};

// Project actions
const openProject = (projectId: string) => {
  router.push(`/projects/${projectId}/player`);
};

const editProject = (projectId: string) => {
  router.push(`/projects/${projectId}/edit`);
};

const deleteProject = (projectId: string) => {
  uiStore.showInfo(`Delete project ${projectId}?`);
  // TODO: Show confirmation dialog and delete
};

const shareProject = (projectId: string) => {
  uiStore.showInfo(`Sharing project ${projectId}`);
  // TODO: Open share modal
};
</script>

<template>
  <div
    class="dashboard-view"
    :style="gradientStyle"
  >
    <!-- Navigation Bar -->
    <Navbar />

    <div class="dashboard-layout">
      <!-- Left Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-section">
          <!-- Upload Action -->
          <div
            class="sidebar-action"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
          >
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              class="file-input"
              @change="handleFileSelect"
            >
            <label
              for="file-upload"
              class="sidebar-action-btn"
              :class="{ dragging: isDragging, 'has-file': hasUploadedFile }"
            >
              <Upload
                :size="48"
                :color="hasUploadedFile ? '#4CAF50' : '#1a1a1a'"
                :stroke-width="1.5"
              />
              <span class="action-label">Upload PDF</span>
            </label>
          </div>

          <!-- Scanner Action (Disabled) -->
          <div
            class="sidebar-action disabled"
            @click="openScanner"
          >
            <div class="sidebar-action-btn">
              <ScanText
                :size="48"
                color="#9E9E9E"
                :stroke-width="1.5"
              />
              <span class="action-label">Scan Book</span>
            </div>
          </div>

          <!-- Uploaded File Info -->
          <div
            v-if="hasUploadedFile"
            class="upload-info"
          >
            <div class="file-info">
              <span class="file-name">{{ uploadedFile?.name }}</span>
              <button
                class="clear-btn"
                @click="clearUpload"
              >
                ×
              </button>
            </div>
            <button
              class="process-btn"
              @click="openConfigModal"
            >
              Process & Configure
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- My VisioBooks Section -->
        <section class="content-section">
          <div class="projects-row">
            <div
              v-for="project in myProjects"
              :key="project.id"
              class="project-card"
              @click="openProject(project.id)"
            >
              <!-- Project Image -->
              <div class="project-image-container">
                <img
                  :src="project.sceneImages[0]"
                  :alt="project.title"
                  class="project-image"
                >
                <!-- Play Button Overlay -->
                <div class="card-overlay">
                  <div
                    class="play-button"
                    @click.stop="openProject(project.id)"
                  >
                    <Play
                      :size="24"
                      color="#a6c3eb"
                      fill="#a6c3eb"
                    />
                  </div>
                </div>
              </div>
              <div class="project-info">
                <div class="project-info-header">
                  <h3 class="project-title">
                    {{ project.title }}
                  </h3>
                  <div class="action-icons">
                    <button
                      class="action-icon-btn"
                      title="Edit"
                      @click.stop="editProject(project.id)"
                    >
                      <Pencil
                        :size="16"
                        color="#a6c3eb"
                      />
                    </button>
                    <button
                      class="action-icon-btn"
                      title="Delete"
                      @click.stop="deleteProject(project.id)"
                    >
                      <Trash2
                        :size="16"
                        color="#a6c3eb"
                      />
                    </button>
                    <button
                      class="action-icon-btn"
                      title="Share"
                      @click.stop="shareProject(project.id)"
                    >
                      <Share2
                        :size="16"
                        color="#a6c3eb"
                      />
                    </button>
                  </div>
                </div>
                <p class="project-meta">
                  {{ project.status }}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Footer -->
    <Footer />

    <!-- Project Configuration Modal -->
    <ProjectConfigModal
      v-if="showConfigModal"
      :project-title="projectTitle"
      :source-file="uploadedFile || undefined"
      @close="showConfigModal = false"
      @generate="handleGenerate"
    />
  </div>
</template>

<style scoped lang="scss">
.dashboard-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-layout {
  display: flex;
  flex: 1;
  padding-top: 70px;
  gap: 0;
}

// Sidebar
.sidebar {
  width: 200px;
  min-width: 200px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.4);

  @media (max-width: 768px) {
    display: none;
  }
}

.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.sidebar-action {
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.sidebar-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  width: 120px;
  height: 120px;

  &:hover:not(.disabled &) {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .action-label {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &.dragging {
    background: rgba(76, 175, 80, 0.1);
    border: 2px dashed #4caf50;
  }

  &.has-file {
    background: rgba(76, 175, 80, 0.1);
    border-color: #4caf50;
  }
}

.action-label {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.upload-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  width: 100%;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-name {
  font-size: 12px;
  color: #1a1a1a;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
}

.process-btn {
  padding: 10px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333;
  }
}

// Main Content
.main-content {
  flex: 1;
  padding: 24px 32px 80px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

// Content Sections
.content-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.show-all-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #1a1a1a;
    background: rgba(0, 0, 0, 0.05);
  }
}

.projects-row {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  }
}

.project-card {
  flex: 0 0 auto;
  width: 180px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.4);
  padding: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .card-overlay {
      opacity: 1;
    }
  }
}

.project-image-container {
  aspect-ratio: 179/243;
  overflow: hidden;
  border-radius: 8px;
  position: relative;
}

.project-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 8px;
  background: transparent;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.play-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgb(255, 255, 255),
    rgb(254, 245, 234),
    rgb(231, 246, 255),
    rgb(227, 237, 248),
    rgb(250, 245, 255),
    rgb(255, 237, 250),
    rgb(255, 237, 250)
  );
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.6),
    inset 0 -1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: transform 0.2s ease;
  padding-left: 3px;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
}

.project-info {
  padding: 8px 4px 4px;
}

.project-info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.action-icons {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.project-card:hover .action-icons {
  opacity: 1;
}

.action-icon-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(193, 213, 237, 0.2);
    transform: scale(1.1);
  }
}

.project-title {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.project-meta {
  font-size: 11px;
  color: #666;
  margin: 4px 0 0;
  text-transform: capitalize;
}
</style>
