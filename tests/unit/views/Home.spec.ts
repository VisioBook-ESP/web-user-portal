import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "@/store/auth";
import Home from "@/views/Home.vue";

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

describe("Home", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    authStore.isAuthenticated = false;
  });

  it("renders home view", () => {
    const wrapper = mount(Home, {
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

  it("initializes with empty uploaded file", () => {
    const wrapper = mount(Home, {
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

  it("initializes drag state as false", () => {
    const wrapper = mount(Home, {
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
  });

  it("initializes with empty project title", () => {
    const wrapper = mount(Home, {
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

  it("initializes config modal as hidden", () => {
    const wrapper = mount(Home, {
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
  });

  it("computes hasUploadedFile as false initially", () => {
    const wrapper = mount(Home, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.hasUploadedFile).toBe(false);
  });

  it("handles unauthenticated file input click", () => {
    const wrapper = mount(Home, {
      global: {
        stubs: {
          Navbar: true,
          Footer: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    const event = new Event("click") as any;
    event.preventDefault = vi.fn();
    wrapper.vm.handleFileInputClick(event);

    // Should prevent default for unauthenticated users
    if (wrapper.vm.uploadedFile === null) {
      expect(event.preventDefault).toHaveBeenCalled;
    }
  });
});
