import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ProjectsView from "@/views/ProjectsView.vue";
import { vi } from "vitest";

vi.mock("@/composables/useGradientBackground", () => ({
  useGradientBackground: () => ({
    gradientStyle: { background: "linear-gradient(135deg, #ffffff, #f0f0f0)" },
  }),
}));

describe("ProjectsView", () => {
  it("renders projects view", () => {
    const wrapper = mount(ProjectsView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
        },
      },
    });

    expect(wrapper.exists()).toBe(true);
  });

  it("displays projects title", () => {
    const wrapper = mount(ProjectsView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
        },
      },
    });

    expect(wrapper.vm.title).toBe("Projects");
  });

  it("has correct title ref value", () => {
    const wrapper = mount(ProjectsView, {
      global: {
        stubs: {
          "v-container": true,
          "v-row": true,
          "v-col": true,
          "v-card": true,
          "v-card-text": true,
        },
      },
    });

    expect(wrapper.vm.title).toBe("Projects");
  });
});
