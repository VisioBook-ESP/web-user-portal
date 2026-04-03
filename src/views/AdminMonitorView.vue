<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useGradientBackground } from "@/composables/useGradientBackground";
import { adminApi } from "@/services/api/adminApi";
import Navbar from "@/components/layout/Navbar/Navbar.vue";
import Footer from "@/components/layout/Footer/Footer.vue";
import {
  Users,
  FolderOpen,
  TrendingUp,
  AlertCircle,
  Activity,
  RefreshCw,
} from "lucide-vue-next";
import type { ApplicationMetrics } from "@/types/api";

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalVisioBooks: number;
  activeUsers: number;
  storageUsed: number;
}

interface MetricsPoint {
  timestamp: string;
  uptime: number;
  averageResponseTime: number;
  errorRate: number;
  requestsPerSecond: number;
}

const router = useRouter();
const authStore = useAuthStore();
const { gradientStyle } = useGradientBackground();

// State
const stats = ref<AdminStats | null>(null);
const metrics = ref<MetricsPoint[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const timeRange = ref<"1h" | "24h" | "7d" | "30d">("24h");

// Check admin access
if (!authStore.isAdmin) {
  router.push("/dashboard");
}

// Computed
const avgResponseTime = computed(() => {
  if (metrics.value.length === 0) return 0;
  const avg =
    metrics.value.reduce((sum, m) => sum + m.averageResponseTime, 0) /
    metrics.value.length;
  return Math.round(avg);
});

const avgErrorRate = computed(() => {
  if (metrics.value.length === 0) return 0;
  const avg =
    metrics.value.reduce((sum, m) => sum + m.errorRate, 0) /
    metrics.value.length;
  return avg.toFixed(2);
});

const minResponseTime = computed(() => {
  if (metrics.value.length === 0) return 0;
  return Math.min(...metrics.value.map((m) => m.averageResponseTime));
});

const maxResponseTime = computed(() => {
  if (metrics.value.length === 0) return 0;
  return Math.max(...metrics.value.map((m) => m.averageResponseTime));
});

const avgUptime = computed(() => {
  if (metrics.value.length === 0) return 100;
  const avg =
    metrics.value.reduce((sum, m) => sum + m.uptime, 0) / metrics.value.length;
  return avg.toFixed(2);
});

// Methods
const loadData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const [statsData, metricsData] = await Promise.all([
      adminApi.getAdminStats(),
      adminApi.getApplicationMetrics(timeRange.value),
    ]);
    console.log("Admin stats:", statsData);
    console.log("Metrics data:", metricsData);

    stats.value = statsData;

    // metricsData is already an array from the API
    metrics.value = Array.isArray(metricsData) ? metricsData : [];
  } catch (err: any) {
    console.error("Failed to load monitoring data:", err);
    error.value = err.message || "Failed to load monitoring data";
  } finally {
    isLoading.value = false;
  }
};

const refreshData = () => {
  loadData();
};

const handleTimeRangeChange = () => {
  loadData();
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getMetricBarWidth = (value: number, max: number) => {
  return (value / max) * 100;
};

const getMetricColor = (value: number, type: "response" | "error") => {
  if (type === "response") {
    if (value < 100) return "#10b981";
    if (value < 300) return "#f59e0b";
    return "#ef4444";
  } else {
    if (value < 1) return "#10b981";
    if (value < 5) return "#f59e0b";
    return "#ef4444";
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="admin-monitor-view" :style="gradientStyle">
    <Navbar />
    <main class="admin-content">
      <div class="admin-container">
        <div class="admin-header">
          <div class="header-top">
            <h1>System Monitor</h1>
            <button
              @click="refreshData"
              class="refresh-btn"
              :disabled="isLoading"
            >
              <RefreshCw :size="18" />
              Refresh
            </button>
          </div>
          <p class="text-gray-600">
            Monitor application performance and health metrics
          </p>
        </div>

        <!-- Time Range Selector -->
        <div class="time-range-selector">
          <label>Time Range:</label>
          <div class="range-buttons">
            <button
              v-for="range in ['1h', '24h', '7d', '30d']"
              :key="range"
              @click="
                timeRange = range as any;
                handleTimeRangeChange();
              "
              :class="['range-btn', { active: timeRange === range }]"
            >
              {{ range }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-banner">
          <AlertCircle :size="18" />
          {{ error }}
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-spinner">
          Loading monitoring data...
        </div>

        <!-- Main Content -->
        <div v-else class="monitor-content">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-header">
                <Users :size="24" />
                <span class="stat-label">Total Users</span>
              </div>
              <div class="stat-value">{{ stats?.totalUsers || 0 }}</div>
              <div class="stat-subtext">
                {{ stats?.activeUsers || 0 }} active
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <FolderOpen :size="24" />
                <span class="stat-label">Projects</span>
              </div>
              <div class="stat-value">{{ stats?.totalProjects || 0 }}</div>
              <div class="stat-subtext">
                {{ stats?.totalVisioBooks || 0 }} VisioBooks
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <Activity :size="24" />
                <span class="stat-label">Response Time</span>
              </div>
              <div class="stat-value">{{ avgResponseTime }}ms</div>
              <div class="stat-subtext">
                {{ minResponseTime }}ms - {{ maxResponseTime }}ms
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-header">
                <TrendingUp :size="24" />
                <span class="stat-label">Error Rate</span>
              </div>
              <div class="stat-value">{{ avgErrorRate }}%</div>
              <div class="stat-subtext">last {{ timeRange }}</div>
            </div>
          </div>

          <!-- Metrics Chart -->
          <div class="metrics-section">
            <h2>Performance Metrics</h2>
            <div v-if="metrics.length > 0" class="metrics-table">
              <div class="metrics-header">
                <div class="metric-col">Timestamp</div>
                <div class="metric-col">Response Time</div>
                <div class="metric-col">Error Rate</div>
                <div class="metric-col">Requests/s</div>
                <div class="metric-col">Uptime</div>
              </div>

              <div
                v-for="(metric, index) in metrics.slice(-10)"
                :key="index"
                class="metrics-row"
              >
                <div class="metric-col timestamp">
                  {{ new Date(metric.timestamp).toLocaleTimeString() }}
                </div>
                <div class="metric-col">
                  <div class="metric-bar-container">
                    <div
                      class="metric-bar"
                      :style="{
                        width:
                          getMetricBarWidth(metric.averageResponseTime, 1000) +
                          '%',
                        backgroundColor: getMetricColor(
                          metric.averageResponseTime,
                          'response',
                        ),
                      }"
                    />
                    <span class="metric-value"
                      >{{ metric.averageResponseTime }}ms</span
                    >
                  </div>
                </div>
                <div class="metric-col">
                  <div class="metric-bar-container">
                    <div
                      class="metric-bar"
                      :style="{
                        width: Math.min(metric.errorRate * 10, 100) + '%',
                        backgroundColor: getMetricColor(
                          metric.errorRate,
                          'error',
                        ),
                      }"
                    />
                    <span class="metric-value"
                      >{{ metric.errorRate.toFixed(2) }}%</span
                    >
                  </div>
                </div>
                <div class="metric-col">
                  {{ metric.requestsPerSecond.toFixed(2) }}
                </div>
                <div class="metric-col">{{ metric.uptime.toFixed(2) }}%</div>
              </div>
            </div>
            <div v-else class="no-metrics">
              No metrics available for this time range
            </div>
          </div>

          <!-- Storage Stats -->
          <div v-if="stats" class="storage-section">
            <h2>Storage Usage</h2>
            <div class="storage-info">
              <div class="storage-stat">
                <span>Used:</span>
                <strong>{{ formatBytes(stats.storageUsed) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<style scoped lang="scss">
.admin-monitor-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-content {
  flex: 1;
  padding: 80px 20px 40px;
  backdrop-filter: blur(0px);
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 30px;

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }
  }

  p {
    font-size: 14px;
  }
}

.refresh-btn {
  background: #1a1a1a;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #333;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.time-range-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .range-buttons {
    display: flex;
    gap: 8px;
  }

  .range-btn {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #999;
    }

    &.active {
      background: #1a1a1a;
      color: white;
      border-color: #1a1a1a;
    }
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #c33;
  font-size: 14px;
}

.loading-spinner {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.monitor-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;

  &:hover {
    border-color: #999;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .stat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    svg {
      color: #1a1a1a;
    }

    .stat-label {
      font-size: 13px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
    }
  }

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 8px;
  }

  .stat-subtext {
    font-size: 13px;
    color: #999;
  }
}

.metrics-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
  }
}

.metrics-table {
  overflow-x: auto;
}

.metrics-header {
  display: grid;
  grid-template-columns: 120px 150px 150px 130px 100px;
  gap: 16px;
  background: #f0f0f0;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.metrics-row {
  display: grid;
  grid-template-columns: 120px 150px 150px 130px 100px;
  gap: 16px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9f9f9;
  }
}

.metric-col {
  display: flex;
  align-items: center;

  &.timestamp {
    color: #999;
    font-weight: 500;
  }
}

.metric-bar-container {
  position: relative;
  height: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 6px;
}

.metric-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  opacity: 0.8;
  transition: width 0.3s ease;
}

.metric-value {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 500;
  color: #1a1a1a;
}

.no-metrics {
  text-align: center;
  padding: 40px;
  color: #999;
}

.storage-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e0e0e0;

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20px;
  }

  .storage-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .storage-stat {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    span {
      font-size: 14px;
      color: #666;
    }

    strong {
      font-size: 18px;
      color: #1a1a1a;
    }
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .metrics-header,
  .metrics-row {
    grid-template-columns: 1fr;
  }

  .metric-col {
    &::before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 8px;
    }
  }
}
</style>
