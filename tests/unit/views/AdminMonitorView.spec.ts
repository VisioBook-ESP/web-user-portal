import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import AdminMonitorView from "@/views/AdminMonitorView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: {},
  })),
}));

vi.mock("@/services/api/adminApi", () => ({
  adminApi: {
    getSystemStats: vi.fn(() =>
      Promise.resolve({
        totalUsers: 10,
        totalProjects: 5,
        totalSessions: 15,
        activeUsers: 3,
        completedProjects: 2,
        failedProjects: 1,
        recentActivity: [
          {
            id: 1,
            type: "user_created",
            description: "New user registered",
            timestamp: "2024-01-01T12:00:00Z",
          },
        ],
      }),
    ),
  },
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("AdminMonitorView", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    authStore.isAuthenticated = true;
    authStore.isAdmin = true;
    authStore.user = {
      id: 1,
      username: "admin",
      email: "admin@example.com",
      role: "admin",
    };
  });

  it("renders the monitor view", () => {
    const wrapper = mount(AdminMonitorView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".admin-monitor-view").exists()).toBe(true);
  });

  it("mounts without errors", async () => {
    const wrapper = mount(AdminMonitorView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.exists()).toBe(true);
  });




});
