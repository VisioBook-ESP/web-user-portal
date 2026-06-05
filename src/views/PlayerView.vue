<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGradientBackground } from "@/composables/useGradientBackground";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronLeft,
  Pencil,
  Trash2,
  Share2,
} from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { gradientStyle } = useGradientBackground();

// Video element ref
const videoRef = ref<HTMLVideoElement | null>(null);

// Player state
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isMuted = ref(false);
const repeatMode = ref<"none" | "all" | "one">("none");
const isFullscreen = ref(false);
const isDraggingProgress = ref(false);

// Mock project data (will be replaced with API call)
const project = ref({
  id: route.params.id as string,
  title: "The Little Prince",
  videoUrl: "/assets/videos/sample.mp4", // Mock video URL
  thumbnailUrl: "/assets/images/Projectimage.png",
});

// Computed
const progress = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const formattedCurrentTime = computed(() => formatTime(currentTime.value));
const formattedDuration = computed(() => formatTime(duration.value));

// Methods
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const togglePlay = () => {
  if (!videoRef.value) return;

  if (isPlaying.value) {
    videoRef.value.pause();
  } else {
    videoRef.value.play();
  }
  isPlaying.value = !isPlaying.value;
};

const handleTimeUpdate = () => {
  if (!videoRef.value || isDraggingProgress.value) return;
  currentTime.value = videoRef.value.currentTime;
};

const handleLoadedMetadata = () => {
  if (!videoRef.value) return;
  duration.value = videoRef.value.duration;
};

const handleEnded = () => {
  isPlaying.value = false;
  if (repeatMode.value === "one") {
    if (videoRef.value) {
      videoRef.value.currentTime = 0;
      videoRef.value.play();
      isPlaying.value = true;
    }
  } else if (repeatMode.value === "all") {
    // In a playlist context, this would go to next video
    if (videoRef.value) {
      videoRef.value.currentTime = 0;
      videoRef.value.play();
      isPlaying.value = true;
    }
  }
};

const seekTo = (event: MouseEvent) => {
  const progressBar = event.currentTarget as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  const newTime = percent * duration.value;

  if (videoRef.value) {
    videoRef.value.currentTime = newTime;
    currentTime.value = newTime;
  }
};

const startDrag = () => {
  isDraggingProgress.value = true;
};

const endDrag = () => {
  isDraggingProgress.value = false;
};

const skipBackward = () => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 10);
};

const skipForward = () => {
  if (!videoRef.value) return;
  videoRef.value.currentTime = Math.min(
    duration.value,
    videoRef.value.currentTime + 10,
  );
};

const toggleRepeat = () => {
  if (repeatMode.value === "none") {
    repeatMode.value = "all";
  } else if (repeatMode.value === "all") {
    repeatMode.value = "one";
  } else {
    repeatMode.value = "none";
  }
};

const toggleMute = () => {
  if (!videoRef.value) return;
  isMuted.value = !isMuted.value;
  videoRef.value.muted = isMuted.value;
};

const setVolume = (event: MouseEvent) => {
  const volumeBar = event.currentTarget as HTMLElement;
  const rect = volumeBar.getBoundingClientRect();
  const percent = (event.clientX - rect.left) / rect.width;
  volume.value = Math.max(0, Math.min(1, percent));

  if (videoRef.value) {
    videoRef.value.volume = volume.value;
    isMuted.value = volume.value === 0;
  }
};

const toggleFullscreen = async () => {
  const container = document.querySelector(".player-container");
  if (!container) return;

  if (!document.fullscreenElement) {
    await container.requestFullscreen();
    isFullscreen.value = true;
  } else {
    await document.exitFullscreen();
    isFullscreen.value = false;
  }
};

const goBack = () => {
  router.back();
};

const editProject = () => {
  router.push(`/projects/${project.value.id}/edit`);
};

const deleteProject = () => {
  // TODO: Show confirmation and delete
};

const shareProject = () => {
  // TODO: Open share modal
};

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.code) {
    case "Space":
      event.preventDefault();
      togglePlay();
      break;
    case "ArrowLeft":
      skipBackward();
      break;
    case "ArrowRight":
      skipForward();
      break;
    case "KeyM":
      toggleMute();
      break;
    case "KeyF":
      toggleFullscreen();
      break;
  }
};

// Lifecycle
onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div class="player-view" :style="gradientStyle">
    <!-- Navigation Bar -->
    <Navbar />

    <!-- Main Player Area -->
    <div class="player-container">
      <!-- Back Button -->
      <button class="back-button" @click="goBack">
        <ChevronLeft :size="24" color="#1a1a1a" />
        <span>Back</span>
      </button>

      <!-- Video Display -->
      <div class="video-wrapper">
        <div class="video-area">
          <div class="video-container" @click="togglePlay">
            <video
              ref="videoRef"
              class="video-player"
              :poster="project.thumbnailUrl"
              @timeupdate="handleTimeUpdate"
              @loadedmetadata="handleLoadedMetadata"
              @ended="handleEnded"
            >
              <source :src="project.videoUrl" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <!-- Play overlay when paused -->
            <div v-if="!isPlaying" class="play-overlay">
              <div class="play-overlay-button">
                <Play :size="44" color="#a6c3eb" fill="#a6c3eb" />
              </div>
            </div>
          </div>

          <!-- Action Icons (Vertical Bar) -->
          <div class="video-actions">
            <button class="action-icon-btn" title="Edit" @click="editProject">
              <Pencil :size="20" color="#b3b3b3" />
            </button>
            <button
              class="action-icon-btn"
              title="Delete"
              @click="deleteProject"
            >
              <Trash2 :size="20" color="#b3b3b3" />
            </button>
            <button class="action-icon-btn" title="Share" @click="shareProject">
              <Share2 :size="20" color="#b3b3b3" />
            </button>
          </div>
        </div>

        <!-- Project Title -->
        <h1 class="project-title">
          {{ project.title }}
        </h1>
      </div>

      <!-- Bottom Controls Bar (Spotify Style) -->
      <div class="controls-bar">
        <!-- Left: Now Playing Info (optional) -->
        <div class="controls-left">
          <img
            :src="project.thumbnailUrl"
            :alt="project.title"
            class="now-playing-thumb"
          />
          <div class="now-playing-info">
            <span class="now-playing-title">{{ project.title }}</span>
            <span class="now-playing-subtitle">VisioBook</span>
          </div>
        </div>

        <!-- Center: Main Controls -->
        <div class="controls-center">
          <!-- Control Buttons -->
          <div class="control-buttons">
            <button
              class="control-btn secondary"
              title="Previous"
              @click="skipBackward"
            >
              <SkipBack :size="20" color="#b3b3b3" fill="#b3b3b3" />
            </button>

            <button
              class="control-btn primary"
              title="Play/Pause"
              @click="togglePlay"
            >
              <Pause
                v-if="isPlaying"
                :size="24"
                color="#b3b3b3"
                fill="#b3b3b3"
              />
              <Play
                v-else
                :size="24"
                color="#b3b3b3"
                fill="#b3b3b3"
                style="margin-left: 2px"
              />
            </button>

            <button
              class="control-btn secondary"
              title="Next"
              @click="skipForward"
            >
              <SkipForward :size="20" color="#b3b3b3" fill="#b3b3b3" />
            </button>

            <button
              class="control-btn secondary"
              :class="{ active: repeatMode !== 'none' }"
              title="Repeat"
              @click="toggleRepeat"
            >
              <Repeat
                :size="20"
                :color="repeatMode !== 'none' ? '#a6c3eb' : '#b3b3b3'"
              />
              <span v-if="repeatMode === 'one'" class="repeat-indicator"
                >1</span
              >
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <span class="time-display">{{ formattedCurrentTime }}</span>
            <div
              class="progress-bar"
              @click="seekTo"
              @mousedown="startDrag"
              @mouseup="endDrag"
            >
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${progress}%` }" />
                <div
                  class="progress-handle"
                  :style="{ left: `${progress}%` }"
                />
              </div>
            </div>
            <span class="time-display">{{ formattedDuration }}</span>
          </div>
        </div>

        <!-- Right: Volume & Other Controls -->
        <div class="controls-right">
          <button
            class="control-btn secondary"
            title="Volume"
            @click="toggleMute"
          >
            <VolumeX
              v-if="isMuted || volume === 0"
              :size="20"
              color="#b3b3b3"
            />
            <Volume2 v-else :size="20" color="#b3b3b3" />
          </button>

          <div class="volume-bar" @click="setVolume">
            <div class="volume-track">
              <div
                class="volume-fill"
                :style="{ width: `${isMuted ? 0 : volume * 100}%` }"
              />
              <div
                class="volume-handle"
                :style="{ left: `${isMuted ? 0 : volume * 100}%` }"
              />
            </div>
          </div>

          <button
            class="control-btn secondary"
            title="Fullscreen"
            @click="toggleFullscreen"
          >
            <Minimize v-if="isFullscreen" :size="20" color="#b3b3b3" />
            <Maximize v-else :size="20" color="#b3b3b3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.player-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.player-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 70px;
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

// Video Area (contains video + action bar)
.video-area {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  max-width: 960px;
  width: 100%;
}

// Video Actions (Vertical Bar)
.video-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.action-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;

  &:hover,
  &:active {
    background: rgba(193, 213, 237, 0.2);
    transform: scale(1.1);

    svg {
      color: #a6c3eb !important;
      stroke: #a6c3eb !important;
    }
  }
}

// Video Wrapper
.video-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  padding-bottom: 120px;
}

.video-container {
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.play-overlay-button {
  width: 96px;
  height: 96px;
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
    rgb(255, 237, 250)
  );
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding-left: 4px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.project-title {
  margin-top: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
}

// Controls Bar (Crystal Glass Style)
.controls-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 100;
}

// Left: Now Playing
.controls-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
  width: 30%;
}

.now-playing-thumb {
  width: 56px;
  height: 56px;
  border-radius: 4px;
  object-fit: cover;
}

.now-playing-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.now-playing-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.now-playing-subtitle {
  font-size: 11px;
  color: #666;
}

// Center: Main Controls
.controls-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 722px;
  width: 40%;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &.secondary {
    width: 32px;
    height: 32px;
    border-radius: 50%;

    &:hover,
    &:active {
      svg {
        color: #a6c3eb !important;
        fill: #a6c3eb !important;
        stroke: #a6c3eb !important;
      }
    }

    &.active {
      &::after {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        background: #a6c3eb;
        border-radius: 50%;
      }
    }
  }

  &.primary {
    width: 36px;
    height: 36px;
    background: transparent;
    border-radius: 50%;

    &:hover,
    &:active {
      transform: scale(1.06);

      svg {
        color: #a6c3eb !important;
        fill: #a6c3eb !important;
        stroke: #a6c3eb !important;
      }
    }
  }
}

.repeat-indicator {
  position: absolute;
  font-size: 8px;
  font-weight: 700;
  color: #a6c3eb;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

// Progress Bar
.progress-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.time-display {
  font-size: 11px;
  color: #666;
  min-width: 40px;
  text-align: center;
  font-family: "SF Mono", "Monaco", "Inconsolata", monospace;
}

.progress-bar {
  flex: 1;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #a6c3eb;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-bar:hover .progress-fill {
  background: #a6c3eb;
}

.progress-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #a6c3eb;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

// Right: Volume Controls
.controls-right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
  width: 30%;
  justify-content: flex-end;
}

.volume-bar {
  width: 93px;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.volume-track {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  position: relative;
}

.volume-fill {
  height: 100%;
  background: #a6c3eb;
  border-radius: 2px;
}

.volume-bar:hover .volume-fill {
  background: #a6c3eb;
}

.volume-handle {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #a6c3eb;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-bar:hover .volume-handle {
  opacity: 1;
}

// Responsive
@media (max-width: 768px) {
  .controls-left {
    display: none;
  }

  .controls-center {
    width: 100%;
    max-width: none;
  }

  .controls-right {
    display: none;
  }

  .video-wrapper {
    padding: 16px;
    padding-bottom: 110px;
  }

  .back-button {
    top: 80px;
    left: 16px;
  }
}

// Fullscreen styles
:fullscreen {
  .player-container {
    padding-top: 0;
  }

  .back-button {
    top: 16px;
  }

  .video-wrapper {
    padding-bottom: 100px;
  }

  .controls-bar {
    background: transparent;
    border-top: none;
    backdrop-filter: none;
  }

  .now-playing-title,
  .time-display {
    color: #fff;
  }

  .now-playing-subtitle {
    color: #b3b3b3;
  }

  .progress-track,
  .volume-track {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>
