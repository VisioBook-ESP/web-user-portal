import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import PlayerView from "@/views/PlayerView.vue";

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

describe("PlayerView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders player view", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("initializes with not playing state", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isPlaying).toBe(false);
  });

  it("initializes current time as 0", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.currentTime).toBe(0);
  });

  it("initializes volume as 1", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.volume).toBe(1);
  });

  it("initializes not muted", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isMuted).toBe(false);
  });

  it("initializes repeat mode as none", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.repeatMode).toBe("none");
  });

  it("initializes fullscreen as false", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.isFullscreen).toBe(false);
  });

  it("loads project data", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.project).toBeDefined();
    expect(wrapper.vm.project?.title).toBe("The Little Prince");
  });

  it("computes progress correctly", () => {
    const wrapper = mount(PlayerView, {
      global: {
        stubs: {
          Navbar: true,
          "lucide-vue-next": true,
        },
      },
    });

    expect(wrapper.vm.progress).toBe(0);
  });
});
