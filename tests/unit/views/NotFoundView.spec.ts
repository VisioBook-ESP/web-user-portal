import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import NotFoundView from "@/views/NotFoundView.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("NotFoundView", () => {
  it("renders 404 view", () => {
    const wrapper = mount(NotFoundView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-icon": true,
          "v-btn": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("renders without errors", () => {
    const wrapper = mount(NotFoundView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-icon": true,
          "v-btn": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("has goHome callback", () => {
    const wrapper = mount(NotFoundView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-icon": true,
          "v-btn": true,
        },
      },
    });

    expect(wrapper.vm.goHome).toBeDefined();
  });

  it("has goHome method", () => {
    const wrapper = mount(NotFoundView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-icon": true,
          "v-btn": true,
        },
      },
    });

    expect(typeof wrapper.vm.goHome).toBe("function");
  });
});
