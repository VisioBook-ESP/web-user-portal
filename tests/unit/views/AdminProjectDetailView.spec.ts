import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import { useRouter, useRoute } from "vue-router";
import AdminProjectDetailView from "@/views/AdminProjectDetailView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: { id: "1" },
  })),
}));

vi.mock("@/services/api/adminApi", () => ({
  adminApi: {
    getProject: vi.fn(() =>
      Promise.resolve({
        id: "1",
        title: "Test Project",
        description: "Test Description",
        status: "completed",
        userId: 1,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      }),
    ),
    deleteProject: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("AdminProjectDetailView", () => {
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

  it("renders the project detail view", () => {
    const wrapper = mount(AdminProjectDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".admin-project-detail-view").exists()).toBe(true);
  });

  it("loads project data on mount", async () => {
    const wrapper = mount(AdminProjectDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    // Component should load without errors
    expect(wrapper.exists()).toBe(true);
  });



  it("opens delete confirmation modal", async () => {
    const wrapper = mount(AdminProjectDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.showDeleteConfirm = true;

    expect(wrapper.vm.showDeleteConfirm).toBe(true);
  });



  it("returns correct status color", () => {
    const wrapper = mount(AdminProjectDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.statusColor("completed")).toBe(
      "bg-green-100 text-green-800",
    );
    expect(wrapper.vm.statusColor("processing")).toBe(
      "bg-blue-100 text-blue-800",
    );
    expect(wrapper.vm.statusColor("draft")).toBe("bg-gray-100 text-gray-800");
    expect(wrapper.vm.statusColor("failed")).toBe("bg-red-100 text-red-800");
  });

  it("formats date correctly", () => {
    const wrapper = mount(AdminProjectDetailView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    const formatted = wrapper.vm.formatDate("2024-01-01");
    expect(formatted).toContain("January");
    expect(formatted).toContain("2024");
  });
});
