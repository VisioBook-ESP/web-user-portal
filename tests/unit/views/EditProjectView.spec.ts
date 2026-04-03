import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useUIStore } from "@/store/ui";
import EditProjectView from "@/views/EditProjectView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: { id: "1" },
  })),
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("EditProjectView", () => {
  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  it("renders edit project view", () => {
    const wrapper = mount(EditProjectView, {
      global: {
        stubs: {
          Navbar: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("initializes with loading state", () => {
    const wrapper = mount(EditProjectView, {
      global: {
        stubs: {
          Navbar: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isLoading).toBe(true);
  });

  it("has project id from route", () => {
    const wrapper = mount(EditProjectView, {
      global: {
        stubs: {
          Navbar: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.projectId).toBe("1");
  });

  it("initializes config modal as hidden", () => {
    const wrapper = mount(EditProjectView, {
      global: {
        stubs: {
          Navbar: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.showConfigModal).toBe(false);
  });

  it("loads project data on mount", async () => {
    const wrapper = mount(EditProjectView, {
      global: {
        stubs: {
          Navbar: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    await flushPromises();

    expect(wrapper.vm.project.title).toBeDefined();
  });

  it("has project config", () => {
    const wrapper = mount(EditProjectView, {
      global: {
        stubs: {
          Navbar: true,
          ProjectConfigModal: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.project.config).toBeDefined();
    expect(wrapper.vm.project.config.style).toBe("realistic");
  });
});
