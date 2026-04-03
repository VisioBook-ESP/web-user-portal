import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";
import AdminProjectsView from "@/views/AdminProjectsView.vue";

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
    getAllProjects: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: "1",
            title: "Test Project",
            status: "completed",
            createdAt: "2024-01-01",
            userId: 1,
          },
        ],
        total: 1,
      }),
    ),
  },
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("AdminProjectsView", () => {
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

  it("renders the projects list view", () => {
    const wrapper = mount(AdminProjectsView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".admin-projects-view").exists()).toBe(true);
  });

  it("loads projects on mount", async () => {
    const wrapper = mount(AdminProjectsView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.projects).toHaveLength(1);
    expect(wrapper.vm.projects[0].title).toBe("Test Project");
  });



  it("filters projects by search query", async () => {
    const wrapper = mount(AdminProjectsView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.searchQuery = "Test";
    wrapper.vm.applyFilters();

    expect(wrapper.vm.filteredProjects).toHaveLength(1);
  });

  it("filters projects by status", async () => {
    const wrapper = mount(AdminProjectsView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    wrapper.vm.statusFilter = "completed";
    wrapper.vm.applyFilters();

    expect(wrapper.vm.filteredProjects).toHaveLength(1);

    wrapper.vm.statusFilter = "processing";
    wrapper.vm.applyFilters();

    expect(wrapper.vm.filteredProjects).toHaveLength(0);
  });

  it("returns correct status color", () => {
    const wrapper = mount(AdminProjectsView, {
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


});
