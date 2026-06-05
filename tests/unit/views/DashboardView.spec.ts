import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import DashboardView from "@/views/DashboardView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: {},
  })),
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("DashboardView", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    authStore.isAuthenticated = true;
    authStore.user = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      role: "user",
    };
  });

  it("renders the dashboard view", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("displays projects", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.myProjects.length).toBeGreaterThan(0);
  });

  it("initializes with empty uploaded file", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.uploadedFile).toBeNull();
  });

  it("initializes with empty project title", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.projectTitle).toBe("");
  });

  it("has mock projects loaded", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.myProjects.length).toBeGreaterThan(0);
  });

  it("toggles config modal visibility", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.showConfigModal).toBe(false);
    wrapper.vm.showConfigModal = true;
    expect(wrapper.vm.showConfigModal).toBe(true);
  });

  it("handles file drop", () => {
    const wrapper = mount(DashboardView, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isDragging).toBe(false);
    wrapper.vm.isDragging = true;
    expect(wrapper.vm.isDragging).toBe(true);
  });
});
